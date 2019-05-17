import dogapi from 'dogapi';
import util from 'util';

import config from 'turtle/config';

const datadogSendMetric = util.promisify(dogapi.metric.send);

dogapi.initialize({
  api_key: config.datadog.apiKey,
  app_key: config.datadog.appKey,
 });

const tags = [
  `env:${config.deploymentEnv}`,
  `platform:${config.platform}`,
];

export function sendMetric(name: string, value: number, additionalTags?: string[]) {
  return datadogSendMetric(name, value, { tags: [...tags, ...(additionalTags || [])] });
}
