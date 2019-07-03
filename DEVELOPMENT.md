# Turtle Development

## Prerequisites

- Working `www` service, see [this README](https://github.com/expo/universe/tree/master/server/www/README.md) for more details.
- Own AWS SQS queues. See [this README](https://github.com/expo/universe/tree/master/terraform/turtle-queues/README.md) to learn more.

## Setup

- Run `update-local-secrets` to populate the `.secrets*` files. You'll need to run this any time any secret changes (it shouldn't be very often).
- Run `EXPO_UNIVERSE_DIR=/path/to/universe/dir yarn secrets:init-private YOUR_SQS_NICKNAME`. Alternatively, you can create `.secrets.local-queue` file with the SQS queues' urls yourself (`AWS_SQS_OUT_QUEUE_URL`, `AWS_SQS_ANDROID_QUEUE_URL`, `AWS_SQS_ANDROID_PRIORITY_QUEUE_URL`, `AWS_SQS_IOS_QUEUE_URL`, `AWS_SQS_IOS_PRIORITY_QUEUE_URL`)
- Run `yarn set-workingdir:local` or `yarn set-workingdir:remote`:
  - `:local` creates symlinks to the shell apps in `expo` repository (_unfortunately this is currently broken_)
  - `:remote` downloads precompiled shell apps
- Run `yarn` to install node modules.
- Run `yarn set-priorities:local` to set priorities configuration. This is not mandatory, but you'll get a lot of annoying messages without this.
- Run `yarn start:ios` or `yarn start:android` to run Turtle.

## Updating shell apps

_TODO_

## Generating recording files for smoke tests

Smoke tests are powered by [Nock](https://www.npmjs.com/package/nock) which uses JSON files containing responses to the HTTP requests fired by the build process.

To record new responses remove old `recording.json` and run tests and then manually schedule a build with `expo-cli` tool.

As a precaution, the file with HTTP requests/responses contains, among other things, iOS certificates used for the test build, is
encrypted with `git-crypt`. Remember not to revoke them, because then the tests will fail.

## Other notes

Turtle uses Redis to get notifications (from www) about builds cancellations. To make this feature working, you have to use the same Redis instance as www. Therefore, you need to remember about starting www before starting Turtle. If you forget about it, don't worry, Turtle will remind you to run `yarn start-docker` in `server/www` directory.

Turtle uploads build artifacts to S3. This could take some time if you have a poor internet connection. To facilitate local development, there is a feature which allows Turtle to fake artifacts upload. `secrets:init-private` script, which you should have run while setting up Turtle, sets fake upload directory to your user's default `Downloads` directory (we're assuming you're using Mac). If you need to test uploading artifacts to S3, you have to edit `.secrets.local` file and comment or remove `TURTLE_FAKE_UPLOAD` and `TURTLE_FAKE_UPLOAD_DIR` environment variables.
