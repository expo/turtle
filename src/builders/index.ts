import { IJob, IJobResult } from 'turtle/job';
import buildAndroid from './android';
import buildIOS from './ios';

const builders: { [index: string]: (job: IJob, logger: any) => Promise<IJobResult>} = {
  ios: buildIOS,
  android: buildAndroid,
};

export default builders;
