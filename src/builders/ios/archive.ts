import runShellAppBuilder from 'turtle/builders/utils/ios/shellAppBuilder';
import { IosIPABuilder as createIPABuilder } from 'xdl';

import { logErrorOnce } from 'turtle/builders/utils/common';
import * as fileUtils from 'turtle/builders/utils/file';
import * as keychain from 'turtle/builders/utils/ios/keychain';
import config from 'turtle/config';
import logger from 'turtle/logger/index';
import { IContext } from 'turtle/types/context';
import { IJob } from 'turtle/types/job';

export default async function buildArchive(ctx: IContext, job: IJob) {
  let keychainInfo;
  try {
    keychainInfo = await keychain.create(ctx);
    const { credentials } = job;
    const { certP12, certPassword } = credentials as { certP12: string; certPassword: string };
    await keychain.importCert(ctx, { keychainPath: keychainInfo.path, certP12, certPassword });
    await runShellAppBuilder(ctx, job);
    await buildAndSignIPA(ctx, job, keychainInfo.path);
  } catch (err) {
    logErrorOnce(err);
    throw err;
  } finally {
    if (keychainInfo) {
      await keychain.remove(ctx, keychainInfo.path);
    }
  }
}

async function buildAndSignIPA(ctx: IContext, job: IJob, keychainPath: string) {
  const l = logger.withFields({ buildPhase: 'building and signing IPA' });
  l.info('building and signing IPA');

  const {
    credentials: { provisioningProfile, certPassword, teamId, password },
    config: { bundleIdentifier: _bundleIdentifierFromConfig },
    experience: { manifest: { ios: { bundleIdentifier: _bundleIdentifierFromManifest } } },
  } = job;

  const bundleIdentifier = _bundleIdentifierFromConfig || _bundleIdentifierFromManifest;

  const { provisioningProfilePath } = ctx;
  await fileUtils.writeBase64ToBinaryFile(provisioningProfilePath, provisioningProfile);
  l.info('saved provisioning profile to temporary path');

  const ipaBuilder = createIPABuilder({
    keychainPath,
    provisioningProfilePath,
    appUUID: ctx.appUUID,
    certPath: ctx.tempCertPath,
    certPassword,
    teamID: teamId,
    password,
    bundleIdentifier,
    workingDir: config.builder.workingDir,
  });
  await ipaBuilder.build();

  l.info(`done building and signing IPA`);
}
