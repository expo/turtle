# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.12.2] - 2019-09-27
### Changed
- Updated Android shell app for SDK 35 to fix crash on Android <=7 due to battery module

## [0.12.1] - 2019-09-20
### Changed
- Updated iOS shell apps for SDK 33 and 34 to fix iOS 13 issues with fishhook, notification tokens, and ShareSheet
- Updated iOS shell app for SDK 35 with a minor fix

## [0.12.0] - 2019-09-19
### Added
- Support for SDK 35 iOS and Android builds.
### Removed
- Support for SDK 27-30 iOS and Android builds.

## [0.11.3] - 2019-09-19
### Changed
- Updated SDK34 Android shell app with `expo-branch` fixes.

## [0.11.2] - 2019-08-21
### Added
- Support for GoogleService-Info.plist (>=34.0.0).

## [0.11.1] - 2019-08-08
### Changed
- Updated iOS client shell app with the latest fixes (up to 2.12.3).

## [0.11.0] - 2019-08-07
### Changed
- Enabled back optional modules support, but only for specific unimodules.
- Updated SDK34 Android shell app with the latest fixes (up to 2.12.2).
- Updated SDK34 iOS shell app with the latest fixes (up to 2.12.3).

## [0.10.0] - 2019-08-01
### Changed
- Fully disabled optional modules on Android for now.
- Updated iOS shell apps for SDK 33 and 34 to fix scoped permissions issue.
- Updated Android shell app for SDK 34 to work after disabling optional modules.

## [0.9.1] - 2019-07-29
### Changed
- `release-it` version to `12.3.4`.

## [0.9.0] - 2019-07-29
### Added
- Android, iOS standalone shell apps and iOS Expo client shell app for SDK34.
- Xcode license check for iOS builds.
### Fixed
- Setting `Constants.nativeAppVersion` for Android standalone builds (actually fixed in [expo/expo-cli#878](https://github.com/expo/expo-cli/pull/878)).
- Passing `expo.android.config` object from `app.json` to the Android builder.
- Fixed crash on launch for iOS standalone apps on iOS 13 (all SDK versions).
- Fixed occasional issue on iOS (SDK 33) where the JS bundle cannot be found ("No cache exists for this resource: shell-app.bundle") and a reload would be required.

## [0.8.11] - 2019-07-16
### Fixed
- Android debug builds.

## [0.8.10] - 2019-07-16
### Fixed
- iOS simulator builds.

## [0.8.9] - 2019-07-15
### Fixed
- User authentication.

## [0.8.8] - 2019-07-11
### Fixed
- LocalAuthentication module on iOS (fixes [expo/expo#663](https://github.com/expo/expo/issues/663)).

## [0.8.7] - 2019-07-05
### Added
- Adhoc Builds: use provisioningProfileId if specified.
- Registering supported SDK versions in Redis.
- Support for 64 bit builds in SDK33.

## [0.8.6] - 2019-06-25
### Added
- Added support for Android build modes: debug or release.
### Fixed
- Upgrading the shell app for a given SDK version when the previous version is already downloaded (bug in `turtle-cli`).
- Updated Android shell app for SDK33 to include `lottie-android@2.5.6` which fixes crashes on Android 9.0 when showing some Lottie animations.
- Schema for `buildModes`.
- Updated @expo/xdl to 55.0.7 (fixed reading from binary plist).

## [0.8.4] - 2019-06-13
### Changed
- Upgraded `sharp` from `0.21.3` to `0.22.1`.
- `gulp-cli` is no longer required to build an app with `turtle-cli`.

## [0.8.3] - 2019-06-13
### Added
- Running Android Turtle process with `supervisor` (pod is restarted if there were 5 failures in the last 10 minutes).
### Changed
- `turtle-cli` is now fetching the app manifest before running the build.

## [0.8.2] - 2019-06-11
### Changed
- Updated Android shell app for SDK33 to remove `expo-face-detector` and `expo-payments-stripe` from standalone builds.
- Updated Android shell app for SDK33 to get rid of `node_modules` for `tools-public`.
- From now on, `turtle-cli` installs dependencies for `tools-public` in shell apps for SDK versions < 33.
### Fixed
- Android builds with turtle-cli by installing all unmodules if `dependencies` is empty.

## [0.8.1] - 2019-06-10
### Changed
- Add expo dependencies when resolving unimodules.
### Fixed
- Support for Android tarballs without `universe-package.json`.

## [0.8.0] - 2019-06-07
### Added
- Turtle CLI logo to the project (created by [@zularizal](https://github.com/zularizal))!
- Shell apps for SDK 33.
- Support for Android App Bundles (App bundles are built by default, use `-t apk` to build apk).
### Changed
- Updated Android shell app for SDK 32 to fix AppAuth issue (https://github.com/expo/expo/pull/4115) and to fix a newer than expected JSC version.
- Default value for build timeout to 15 minutes.
- Added filtering of logs (strips out download progress) when downloading SDK tools.
- `xdl` -> `@expo/xdl`, updated `@expo/xdl`.
### Fixed
- Generating Android keystore in turtle when one is not passed to turtle-cli (https://github.com/expo/turtle/pull/65).
- Upload logs to s3 if build has been canceled or timed out.
- Unhandled exception on asset download (xdl).

## [0.7.2] - 2019-05-09
### Added
- Support for Android tarballs without `universe-package.json`.
### Changed
- Upgraded `@expo/traveling-fastlane-darwin` to 1.9.4 (fixes issues with generating provisioning profiles for ad-hoc builds).
### Removed
- Support for `CLIENT_LOGGER_LEVEL` env variable.

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
- Registering Turtle version in Redis.
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
