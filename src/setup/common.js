import fs from 'fs-extra';

import config from 'turtle/config';

export default async function commonSetup() {
  await fs.remove(config.builder.temporaryFilesRoot);
  await fs.remove(config.builder.tempS3LogsDir);
}
