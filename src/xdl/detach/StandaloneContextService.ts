import StandaloneBuildFlags from './StandaloneBuildFlags';
import {
  IStandaloneContextDataService,
  StandaloneContext,
  StandaloneContextDataType,
} from './StandaloneContext';

export class StandaloneContextService extends StandaloneContext {
  public type: StandaloneContextDataType = 'service';
  constructor(
    public data: IStandaloneContextDataService,
    public published: {
      url: string;
      releaseChannel: string;
    },
    public build: StandaloneBuildFlags,
  ) {
    super();
  }

  /**
   *  On iOS we begin configuring standalone apps before we have any information about the
   *  project's manifest.
   */
  public isAnonymous() {
    return true;
  }
}
