import iosJobSchema from './ios';

describe('iOS job schema', () => {
  it('allows for empty credentials object when buildType = simulator', () => {
    const job = {
      platform: 'ios',
      config: {
        buildType: 'simulator',
        releaseChannel: 'default',
        bundleIdentifier: 'com.swm.expo.testapp',
      },
      experienceName: '@dsokal-local/testapp',
    };
    expect(() => {
      validate(job);
    }).not.toThrow();
  });

  it("doesn't allows for empty credentials object when buildType = archive", () => {
    const job = {
      platform: 'ios',
      config: {
        buildType: 'archive',
        releaseChannel: 'default',
        bundleIdentifier: 'com.swm.expo.testapp',
      },
      experienceName: '@dsokal-local/testapp',
    };
    expect(() => {
      validate(job);
    }).toThrow(/"credentials" is required/);
  });
});

const validate = obj => {
  const { error, value } = iosJobSchema.validate(obj);
  if (error) {
    throw error;
  } else {
    return value;
  }
};
