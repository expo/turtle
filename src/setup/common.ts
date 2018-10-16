import fs from 'fs-extra';

import config from 'turtle/config';
import * as metrics from 'turtle/metrics';

export default async function commonSetup() {
  await metrics.init();
  await fs.remove(config.directories.temporaryFilesRoot);
  await fs.remove(config.directories.tempS3LogsDir);
}
