import config from 'turtle/config';

export const TYPE_DIMENSIONS = (type: string) => [
  [
    { Name: 'env', Value: config.deploymentEnv },
    { Name: 'platform', Value: config.platform },
    { Name: 'type', Value: type },
  ],
  [
    { Name: 'env', Value: config.deploymentEnv },
    { Name: 'platform', Value: config.platform },
    { Name: 'type', Value: type },
    { Name: 'host', Value: config.hostname },
  ],
];

export const PRIORITY_DIMENSIONS = (type: string, priority: string) => [
  [
    { Name: 'env', Value: config.deploymentEnv },
    { Name: 'platform', Value: config.platform },
    { Name: 'priority', Value: priority },
  ],
  [
    { Name: 'env', Value: config.deploymentEnv },
    { Name: 'platform', Value: config.platform },
    { Name: 'type', Value: type },
  ],
  [
    { Name: 'env', Value: config.deploymentEnv },
    { Name: 'platform', Value: config.platform },
    { Name: 'type', Value: type },
    { Name: 'priority', Value: priority },
  ],
  [
    { Name: 'env', Value: config.deploymentEnv },
    { Name: 'platform', Value: config.platform },
    { Name: 'type', Value: type },
    { Name: 'host', Value: config.hostname },
  ],
];
