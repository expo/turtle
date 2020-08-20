import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { v4 as uuid } from 'uuid';

import { getRedisClient, RedisClient } from 'turtle/utils/redis';

interface ILeaderParams {
  key: string;
  id?: string;
  ttl?: number;
  wait?: number;
}

const RENEW_LEADER_SCRIPT = `
  local leader_key = KEYS[1]
  local leader_id = KEYS[2]
  local leader_ttl = KEYS[3]

  local current_leader

  current_leader = redis.call("get", leader_key)
  if (current_leader == leader_id) then
    redis.call("pexpire", leader_key, leader_ttl)
    return "ok"
  else
    return "you_are_not_the_leader"
  end
`;

const STOP_BEING_LEADER_SCRIPT = `
  local leader_key = KEYS[1]
  local leader_id = KEYS[2]

  local current_leader

  current_leader = redis.call("get", leader_key)
  if (current_leader == leader_id) then
    redis.call("del", leader_key)
    return "ok"
  else
    return "you_are_not_the_leader"
  end
`;

interface IRedisCustom extends Redis.Redis {
  renewLeader(key: string, id: string, ttl: number): Promise<string>;
  stopBeingLeader(key: string, id: string): Promise<string>;
}

enum LeaderEvent {
  elected = 'elected',
  revoked = 'revoked',
  error = 'error',
}

class Leader extends EventEmitter {
  private key: string;
  private id: string;
  private ttl: number;
  private wait: number;
  private waitId?: NodeJS.Timeout;
  private redisClientValue?: IRedisCustom;
  private renewId?: NodeJS.Timeout;
  private started = false;

  constructor({ key, id, ttl = 30, wait = 1000 }: ILeaderParams) {
    super();

    this.key = key;
    this.id = id || uuid();
    this.ttl = ttl * 1000;
    this.wait = wait;
  }
  public async elect(): Promise<void> {
    if (!this.redisClientValue) {
      await this.init();
    }

    if (!this.started) {
      this.started = true;
    }

    try {
      const res = await this.redisClient.set(this.key, this.id, 'PX', this.ttl, 'NX');
      if (res === null) {
        this.waitId = setTimeout(() => {
          this.elect();
        }, this.wait);
      } else {
        this.emit(LeaderEvent.elected);
        this.renewId = setInterval(() => {
          this.renew();
        }, this.ttl / 2);
      }
    } catch (err) {
      this.emit(LeaderEvent.error, err);
    }
  }

  public async stop(): Promise<void> {
    if (!this.started) {
      throw new Error('You should start the election first!');
    }
    try {
      const res = await this.redisClient.stopBeingLeader(this.key, this.id);
      if (res === 'ok') {
        this.emit(LeaderEvent.revoked);
      }
      if (this.renewId) {
        clearInterval(this.renewId);
      }
      if (this.waitId) {
        clearTimeout(this.waitId);
      }
      this.redisClientValue?.disconnect();
      this.redisClientValue = undefined;
    } catch (err) {
      this.emit(LeaderEvent.error, err);
    }
  }

  private get redisClient(): IRedisCustom {
    if (!this.redisClientValue) {
      throw new Error('Please run the init method first!');
    }
    return this.redisClientValue as IRedisCustom;
  }

  private async init(): Promise<void> {
    if (this.redisClientValue) {
      return;
    }
    this.redisClientValue = await getRedisClient(RedisClient.Configuration);
    const redisClient = this.redisClient as IRedisCustom;
    redisClient.defineCommand('renewLeader', {
      numberOfKeys: 3,
      lua: RENEW_LEADER_SCRIPT,
    });
    redisClient.defineCommand('stopBeingLeader', {
      numberOfKeys: 2,
      lua: STOP_BEING_LEADER_SCRIPT,
    });
  }

  private async renew(): Promise<void> {
    try {
      const result = await this.redisClient.renewLeader(this.key, this.id, this.ttl);
      if (result === 'you_are_not_the_leader') {
        if (this.renewId) {
          clearInterval(this.renewId);
        }
        this.waitId = setTimeout(() => {
          this.elect();
        }, this.wait);
        this.emit(LeaderEvent.revoked);
      }
    } catch (err) {
      this.emit(LeaderEvent.error, err);
    }
  }
}

export default Leader;
export { LeaderEvent };
