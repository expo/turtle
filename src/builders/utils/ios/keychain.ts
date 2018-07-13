import { IosKeychain } from 'xdl';

import * as fileUtils from 'turtle/builders/utils/file';
import logger from 'turtle/logger';
import { IContext } from 'turtle/types/context';
import { IKeychain } from 'turtle/types/keychain';

export async function create(ctx: IContext): Promise<IKeychain> {
  const l = logger.withFields({ buildPhase: 'creating keychain' });
  try {
    l.info('creating keychain...');
    const keychainInfo = await IosKeychain.createKeychain(ctx.appUUID, false);
    l.info('done creating keychain');
    return keychainInfo;
  } catch (err) {
    l.error('unable to create keychain');
    throw err;
  }
}

export async function remove(ctx: IContext, keychainPath: string) {
  const l = logger.withFields({ buildPhase: 'deleting keychain' });
  try {
    l.info('delete keychain...');
    const keychainInfo = await IosKeychain.deleteKeychain({
      path: keychainPath,
      appUUID: ctx.appUUID,
    });
    l.info('done deleting keychain');
    return keychainInfo;
  } catch (err) {
    l.error('unable to delete keychain');
    throw err;
  }
}

export async function importCert(
  ctx: IContext,
  {
    keychainPath,
    certP12,
    certPassword,
  }: { keychainPath: string; certP12: string; certPassword: string },
) {
  const l = logger.withFields({ buildPhase: 'importing certificate into keychain' });
  try {
    l.info('importing distribution certificate into keychain...');
    const { tempCertPath: certPath } = ctx;
    await fileUtils.writeBase64ToBinaryFile(certPath, certP12);
    await IosKeychain.importIntoKeychain({ keychainPath, certPath, certPassword });
    l.info('done importing distribution certificate into keychain');
  } catch (err) {
    l.error('unable to import distribution certificate into keychain');
    throw err;
  }
}
