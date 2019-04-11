import { IContext } from 'turtle/builders/ios/context';
import runShellAppBuilder from 'turtle/builders/utils/ios/shellAppBuilder';
import { IJob } from 'turtle/job';

export default async function buildSimulator(ctx: IContext, job: IJob) {
  ctx.logger = ctx.logger.child({ buildPhase: 'running simulator builder' });
  ctx.logger.info('running simulator build');
  await runShellAppBuilder(ctx, job);
  ctx.logger.info('build complete');
}
