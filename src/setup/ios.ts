import os from 'os';
import path from 'path';
import fs from 'fs-extra';

import * as keychain from 'turtle/builders/utils/ios/keychain';
import logger from 'turtle/logger';
import commonSetup from 'turtle/setup/common';

async function deleteProvisioningProfilesFromHomedir() {
  const provisioningProfilesDir = path.join(os.homedir(), 'Library/MobileDevice/Provisioning Profiles');
  const exists = await fs.pathExists(provisioningProfilesDir);
  if (exists) {
    const provisioningProfiles = (await fs.readdir(provisioningProfilesDir)).filter(
      filename => path.extname(filename) === '.mobileprovision',
    );
    await Promise.all(provisioningProfiles.map(file => fs.remove(path.join(provisioningProfilesDir, file))));
  }
}

export default async function setup() {
  logger.info('Setting up environment...');
  await deleteProvisioningProfilesFromHomedir();
  await keychain.cleanUp();
  await commonSetup();
  logger.info('Finished setting up environment');
}
