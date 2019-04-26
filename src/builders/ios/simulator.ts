import { IContext } from 'turtle/builders/ios/context';
import runShellAppBuilder from 'turtle/builders/utils/ios/shellAppBuilder';
import { IJob } from 'turtle/job';
import logger from 'turtle/logger';

export default async function buildSimulator(ctx: IContext, job: IJob) {
  const l = logger.child({ buildPhase: 'running simulator builder' });
  l.info('running simulator build');
  await runShellAppBuilder(ctx, job);
  l.info('build complete');
}
