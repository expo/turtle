import config from 'turtle/config';

export const QUEUE_URL = () => (config.sqs.queues as any)[config.platform];
export const OUTPUT_QUEUE_URL = () => config.sqs.queues.out;
