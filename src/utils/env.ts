export const env = (varName: string, defaultValue?: any) => {
  const envVar = process.env[varName];
  if (!envVar) {
    if (defaultValue !== undefined) {
      return defaultValue;
    } else if (isOffline()) {
      // allow for null values in offline mode
      return null;
    } else {
      throw new Error(`environment variable ${varName} isn't specified`);
    }
  } else {
    return envVar;
  }
};
export const envOptional = (varName: string) => env(varName, null);
export const envTransform = (varName: string, defaultValue: any, fn: any) => fn(env(varName, defaultValue));
export const envNum = (varName: string, defaultValue?: number) => parseInt(env(varName, defaultValue), 10);
export const envBoolean = (varName: string, defaultValue?: boolean) => {
  let defaultString;
  if (defaultValue === true) {
    defaultString = 'true';
  } else if (defaultValue === false) {
    defaultString = 'false';
  } else {
    defaultString = defaultValue;
  }
  return env(varName, defaultString) === 'true';
};

const isOffline = () => process.env.TURTLE_MODE === 'offline';
