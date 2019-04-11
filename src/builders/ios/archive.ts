import _ from 'lodash';
import { IosIPABuilder as createIPABuilder } from 'xdl';

import { IContext } from 'turtle/builders/ios/context';
import { logErrorOnce } from 'turtle/builders/utils/common';
import * as fileUtils from 'turtle/builders/utils/file';
import * as keychain from 'turtle/builders/utils/ios/keychain';
import runShellAppBuilder from 'turtle/builders/utils/ios/shellAppBuilder';
import { IJob } from 'turtle/job';

export default async function buildArchive(ctx: IContext, job: IJob) {
  let keychainInfo;
  try {
    keychainInfo = await keychain.create(ctx);
    const { credentials } = job;
    const { certP12, certPassword } = credentials as { certP12: string; certPassword: string };
    await keychain.importCert(ctx, { keychainPath: keychainInfo.path, certP12, certPassword });
    const manifest = await runShellAppBuilder(ctx, job);
    await buildAndSignIPA(ctx, job, keychainInfo.path, manifest);
  } catch (err) {
    logErrorOnce(err, ctx.logger);
    throw err;
  } finally {
    if (keychainInfo) {
      await keychain.remove(ctx, keychainInfo.path);
    }
  }
}

async function buildAndSignIPA(ctx: IContext, job: IJob, keychainPath: string, manifest: any) {
  ctx.logger = ctx.logger.child({ buildPhase: 'building and signing IPA' });
  ctx.logger.info('building and signing IPA');

  const {
    credentials: { provisioningProfile, certPassword, teamId },
    config: { bundleIdentifier: bundleIdentifierFromConfig },
  } = job;

  const bundleIdentifierFromManifest = _.get(manifest, 'ios.bundleIdentifier');
  const bundleIdentifier = bundleIdentifierFromConfig || bundleIdentifierFromManifest;

  const { provisioningProfilePath } = ctx;
  await fileUtils.writeBase64ToBinaryFile(provisioningProfilePath, provisioningProfile as string);
  ctx.logger.info('saved provisioning profile to temporary path');

  const ipaBuilder = createIPABuilder({
    keychainPath,
    provisioningProfilePath,
    appUUID: ctx.appUUID,
    certPath: ctx.tempCertPath,
    certPassword,
    teamID: teamId,
    bundleIdentifier,
    workspacePath: ctx.workspacePath,
    manifest,
  });
  await ipaBuilder.build();

  ctx.logger.info(`done building and signing IPA`);
}
