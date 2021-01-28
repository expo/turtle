import StandaloneBuildFlags from './StandaloneBuildFlags';
import {
  IStandaloneContextDataUser,
  StandaloneContext,
  StandaloneContextDataType,
} from './StandaloneContext';

export class StandaloneContextUser extends StandaloneContext {
  public type: StandaloneContextDataType = 'user';
  constructor(
    public data: IStandaloneContextDataUser,
    public published: {
      url?: string;
      releaseChannel: 'default';
    },
    public build: StandaloneBuildFlags,
  ) {
    super();
  }
}
