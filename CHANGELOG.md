# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Upgraded `@expo/traveling-fastlane-darwin` to 1.9.4 (fixes issues with generating provisioning profiles for ad-hoc builds).

## [0.7.1] - 2019-05-06
### Fixed
- Resolving `fastlane` version when `LC_ALL` is not set.

## [0.7.0] - 2019-05-06
### Added
- Support for custom Android builds.
### Changed
- Refactored logger.
### Fixed
- `platform` log field wrongly set to `ios` for Android builds (when using `turtle-cli`).
- Brought back `jobID` and `experienceName` fields to Android logs.

## [0.6.1] - 2019-04-23
### Added
- Checking fastlane version before running build (turtle-cli).
### Changed
- Updated iOS shell app for SDK 32 to fix AppAuth issue.
- Babel replaced by ttypescript.
- Updated xdl to 53.5.3 and @expo/spawn-async to 1.4.2, so that error stack traces should be more informative now.
### Fixed
- Brought back `jobID` and `experienceName` fields to GCloud logs.
### Removed
- `buidAndroidTarballLocally.sh` script (it has been moved to expo repository - [expo/expo#4022](https://github.com/expo/expo/pull/4022)).

## [0.6.0] - 2019-04-09
### Changed
- Removed Branch module from Android shell apps for all SDK versions.

## [0.5.15] - 2019-04-03
### Added
- Turtle smoke tests are now being executed on CircleCI from the context of this repository.
### Changed
- Updated iOS shell app for SDK 32 (fixes [this loading issue for slow connections](https://github.com/expo/expo/issues/3574)).
- Minor infra changes (doesn't affect users).
- Error logs format - error objects are now passed in an object being passed as the first argument to logger function.
### Removed
- Sending logs to loggly.

## [0.5.14] - 2019-03-22
### Added
- `--config` parameter for turtle-cli commands, which allows to specify a custom path to app.json file
### Changed
- Updated iOS shell app for SDK 32 (fixes [this notifications issue](https://github.com/expo/expo/issues/3663)).

## [0.5.13] - 2019-03-12
### Added
- Android SDK version support validation.
### Changed
- iOS Enterprise builds don't compile bitcode now.

## [0.5.12] - 2019-02-26
### Added
- Google Cloud logger (as a bunyan stream).
### Changed
- Android builder passes the manifest from a build job message if it's available.

## [0.5.11] - 2019-02-22
### Added
- Builder for iOS client apps.

## [0.5.10] - 2019-02-19
### Added
- Register Turtle version in Redis.
### Changed
- Update Android shell app for SDK 32 to fix [update](https://github.com/expo/expo/issues/3504) and [back button](https://github.com/expo/expo/issues/1786) issues.

## [0.5.9] - 2019-02-06
- Update iOS shell app for SDK 32 (fixes bare notifications [issue](https://github.com/expo/expo/issues/3223)).

## [0.5.7] - 2019-01-31
- Update Android shell app for SDK 32 to fix bundled assets issue.

## [0.5.6] - 2019-01-25
- Update iOS shell app for SDK 30, 31 and 32 (built with xcode 10.1).

## [0.5.5] - 2019-01-24
### Added
- Sending build duration in AWS SQS messages (of `FINISHED` and `ERRORED` types).

## [0.5.4] - 2019-01-22
### Changed
- Update iOS shell app for SDK32 to [`expo/expo#0847c10`](https://github.com/expo/expo/commit/0847c1073d38c366866f3d9279ddd662da47dc9b), i.e. v2.10.3 with fixed WebView navigation scheme and upgraded Facebook SDK.

## [0.5.3] - 2019-01-21
### Fixed
- Building Android standalone apps ([not accepted license issue](https://github.com/expo/expo/issues/3266)) - updated Android build tools (`build-tools;28.0.3`, `platforms;android-28`).

## [0.5.2] - 2019-01-18
### Added
- The link (in README) to the repository containing `turtle-cli` usage example.
- [Contributing guide](CONTRIBUTING.md).
- [Code of Conduct](CODE_OF_CONDUCT.md).
### Removed
- `eslint`
### Changed
- Fix all `tslint` errors.

## [0.5.1] - 2019-01-16
### Changed
- Update Android shell app for SDK32 that includes `react-native-screens@1.0.0-alpha.22`.

## [0.5.0] - 2019-01-16
### Added
- Turtle version is added to the `onFinish` and `onError` build messages.
### Changed
- A version property value being sent to the queue. It's now the version number
from `package.json` instead of `new`/`old` indicator.
### Removed
- `--push-p12-path` parameter for `turtle build:ios` command,
a Push Notifications Certificate is no longer required to perform a successful
iOS standalone app build.

## [0.4.3] - 2019-01-09
### Changed
- Update iOS shell app for SDK32.
- Update Android shell app for SDK32.
