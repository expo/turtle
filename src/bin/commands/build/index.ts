import { default as buildIOS } from 'turtle/bin/commands/build/ios';
import { default as buildAndroid } from 'turtle/bin/commands/build/android';

function createCommand(builder: any) {
  return (program: any) => {
    return builder(program, setCommonCommandOptions);
  };
}

function setCommonCommandOptions(cmd: any) {
  cmd
    .option('-u --username <username>', 'username (you can also set EXPO_USERNAME env variable)')
    .option('-p --password <password>', 'password (you can also set EXPO_PASSWORD env variable)')
    .option('-d --build-dir <build-dir>', 'directory for build artifact (default: `~/expo-apps`)')
    .option('-o --output <output-file-path>', 'output file path')
    .option(
      '--public-url <url>',
      'the URL of an externally hosted manifest (for self-hosted apps).'
    )
    .option(
      '--release-channel <channel-name>',
      'pull from specified release channel (default: default)'
    );
}

export default {
  ios: createCommand(buildIOS),
  android: createCommand(buildAndroid),
}
