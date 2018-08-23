export enum JOB_STATES {
  PENDING = 'pending',
  STARTED = 'started',
  IN_PROGRESS = 'in-progress',
  FINISHED = 'finished',
  ERRORED = 'errored',
  SENT_TO_QUEUE = 'sent-to-queue',
};

export const UPDATE_CREDENTIALS = 'update-credentials';

export type JOB_UPDATE_TYPE = JOB_STATES | 'update-credentials';
