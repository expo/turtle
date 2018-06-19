import runShellAppBuilder from 'turtle/builders/utils/ios/shellAppBuilder';
import logger from 'turtle/logger';
import { IContext } from 'turtle/types/context';
import { IJob } from 'turtle/types/job';

export default async function buildSimulator(ctx: IContext, job: IJob) {
  const l = logger.withFields({ buildPhase: 'running simulator builder' });
  l.info('running simulator build');
  await runShellAppBuilder(ctx, job);
  l.info('build complete');
}
