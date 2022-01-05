# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Swap out Cloudfront CDN for `classic-assets.eascdn.net`. [#375](https://github.com/expo/turtle/pull/375)

# [0.24.3] - 2021-12-29

- Update ios sdk 44 shell tarball with [orientation lock fix](https://github.com/expo/expo/pull/15715)

# [0.24.2] - 2021-12-16

- Update Android shell tarball for SDK 44.

# [0.24.1] - 2021-12-15

- Update iOS and Android tarballs for SDK 44 RC. [#369](https://github.com/expo/turtle/pull/369).

# [0.24.0] - 2021-12-10

- Update iOS and Android tarballs for SDK 44 beta.
- Add detection for Expo modules using `expo-module.config.json`, the successor to `unimodule.json`. [#368](https://github.com/expo/turtle/pull/368).
- Redirect google bintray url to localhost. [#361](https://github.com/expo/turtle/pull/361)

# [0.23.6] - 2021-12-08

- Update android shell tarballs for bintray error fix. [#363](https://github.com/expo/turtle/pull/363)
- Update AWS SDK. [#365](https://github.com/expo/turtle/pull/365)

# [0.23.5] - 2021-11-12

- Update iOS SDK 43 tarball with expo-updates fix for [#14967](https://github.com/expo/expo/issues/14967)

# [0.23.4] - 2021-11-09

- Update Android SDK 43 tarball with expo-updates fix for [#15112](https://github.com/expo/expo/issues/15112)

# [0.23.3] - 2021-11-04

- Update iOS and Android SDK 43 tarballs with expo-updates fixes for [#14930](https://github.com/expo/expo/issues/14930)

# [0.23.2] - 2021-10-29

- Update Android SDK 43 shell app with proguard fix

# [0.23.1] - 2021-10-20

- Add iOS and Android tarballs for SDK 43

# [0.23.0] - 2021-10-07

- Add iOS and Android beta tarballs for SDK 43
- Bump xdl to fix Android shell app for SDK 43

# [0.22.6] - 2021-10-01

- add `ACCESS_MEDIA_LOCATION` to blacklist for android permissions
- disable automatic versioning in Xcode 13

# [0.22.5] - 2021-09-09

- Fix s3 logger stream close crash.
- Update Android tarballs SDK 42, 41, 40, and 39 to include location workaround.
- Update Android tarball to include a local assets fix on SDK 42.

# [0.22.4] - 2021-07-27

- Update iOS and Android tarballs for SDK 42.

# [0.22.3] - 2021-07-02

- Update Android tarball for SDK 42.

# [0.22.1] - 2021-06-29

- Update iOS and Android beta tarballs for SDK 42.

# [0.22.0] - 2021-06-22

- Add iOS and Android beta tarballs for SDK 42.

# [0.21.9] - 2021-06-15

- Update `sharp` package, fixes support for M1 macs.

# [0.21.8] - 2021-05-25

- Update Android SDK41 tarball.

# [0.21.7] - 2021-05-21

- Update iOS SDK41 tarball.
- Update Android SDK41 tarball.

# [0.21.6] - 2021-04-22

- Update iOS SDK41 tarball.
- Update Android SDK41 tarball.

# [0.21.5] - 2021-04-15

- Revert iOS client tarball for SDK 41, use the SDK 40 tarball. No longer supporting this feature in SDK 41+.
- Update Android SDK 41 tarball.

# [0.21.4] - 2021-04-13

- Update iOS client tarball for SDK 41.

# [0.21.3] - 2021-04-13

- Update SDK 41 tarball for iOS and Android.

# [0.21.2] - 2021-04-07

- Update SDK 41 beta tarball for Android.

# [0.21.1] - 2021-04-01

- Update SDK 41 beta tarball for iOS.

# [0.21.0] - 2021-03-29

- Add SDK 41 beta tarballs.
- Bump @expo/xdl to 59.1.0.

# [0.20.7] - 2021-01-26

- Remove Go suffix from android app name

# [0.20.6] - 2021-01-25

- Update tarballs for SDK 40 patch release (3e345dd)

# [0.20.5] - 2020-12-23

### Changed

- Updated SDK 40 Android tarball to fix `expo-location` background permissions on Android <9.

# [0.20.4] - 2020-12-17

### Changed

- Updated SDK 40 iOS tarball to fix `expo-notifications` not emitting initial notification response.

# [0.20.3] - 2020-12-10

### Fixed

- Verify jq installation before proceeding with release ([#281](https://github.com/expo/turtle/pull/281)).
- Fixed the iOS build when running offline and user lacks elevated permissions.

# [0.20.2] - 2020-12-09

### Changed

- Updated SDK 40 Android tarball to fix `expo-notifications` installation identifier changing as a bug.

# [0.20.1] - 2020-12-08

### Changed

- Update SDK 40 iOS and Android tarballs for release

# [0.20.0] - 2020-11-30

- Add SDK 40 tarballs in preparation for SDK 40 beta

# [0.19.1] - 2020-11-19

### Fixed

- Fixed the iOS build using Xcode 12.1 by runnig `xcrun simctl list` before the build phase.
- Rebuild iOS tarballs (SDK 36, 37, 38, 39, Ad-Hoc Client) with Xcode 12.1 containing iOS 14 image fix.

# [0.19.0] - 2020-11-13

### Changed

- Rebuild iOS tarballs (SDK 36, 37, 38, 39, Ad-Hoc Client) with Xcode 12.1.

# [0.18.9] - 2020-11-09

### Fixed

- Updated xdl to 58.0.20 to fix an issue with updates.checkAutomatically not being applied properly to SDK 39 Android apps.

# [0.18.8] - 2020-10-27

### Fixed

- Fix issues with Reanimated v2 in Android SDK 39 tarball.

# [0.18.7] - 2020-10-23

### Fixed

- Fix issue with updates in self-hosted Android apps ([#10746](https://github.com/expo/expo/issues/10746)) in the SDK 39 tarball

# [0.18.6] - 2020-10-22

### Fixed

- Fix issues with notifications ([10624](https://github.com/expo/expo/pull/10624) and [10608](https://github.com/expo/expo/pull/10608)) in the Android SDK 39 tarball.

# [0.18.5] - 2020-10-07

### Fixed

- Always add expo-notifications for SDK >= 39 projects with android.enableDangerousExperimentalLeanBuilds enabled.

# [0.18.4] - 2020-10-06

### Fixed

- Fixed an issue with notifications ([expo/expo#10562](https://github.com/expo/expo/issues/10562)) in the Android SDK 39 tarball.

# [0.18.3] - 2020-10-03

### Fixed

- Update @expo/xdl to fix regression in SDK <= 39 splash

# [0.18.2] - 2020-10-03

### Fixed

- Updated SDK 39 Android tarball.
- Updated SDK 39 iOS tarball.
- Updated iOS client tarball.
- Update @expo/config and @expo/xdl. Temporarily bring in type definitions for color-string and xcode.

## [0.18.1] - 2020-09-22

### Fixed

- Fix building apps using SDK 39 for Android.

## [0.18.0] - 2020-09-21

### Added

- Added iOS and Android shell apps for SDK 39.

### Removed

- Dropped support for SDK 35.

## [0.17.3] - 2020-09-14

### Added

- Added gradle 6.2 to `turtle-android-base`
- Added `ANDROID_NDK_HOME` in `turtle-android-base`

### Changed

- Upgraded XDL so it processes root `build.gradle` of Android shell apps too

## [0.17.2] - 2020-08-06

### Changed

- Updated iOS shell app for SDK 38 with fixed integer tagging in expo-gl for iOS 14. ([#245](https://github.com/expo/turtle/pull/245))

## [0.17.1] - 2020-08-05

### Changed

- Updated Android shell app for SDK 38 with `targetSdkVersion` bumped to 29. ([#244](https://github.com/expo/turtle/pull/244))

## [0.17.0] - 2020-07-16

### Added

- `--gradle-args` option for `turtle build:android` which makes it possible to specify custom Gradle arguments.

### Changed

- Gradle Wrapper doesn't print when dots when the appropriate version of Gradle is being downloaded.

## [0.16.2] - 2020-07-01

### Added

- Added `--allow-non-https-public-url` to allow bypass of protocol validation on `--public-url`.
- Added support for dynamic configs (`app.config.ts`, `app.config.js`).

## [0.16.0] - 2020-06-25

### Added

- Added iOS shell app for Expo SDK38.
- Added Android shell app for SDK 38.

### Removed

- Dropped support for SDK 34.

## [0.15.1] - 2020-06-22

### Changed

- Configure Turtle to use the Redis CA certificate.

### Fixed

- Fix announcing supported SDK versions.

## [0.15.0] - 2020-06-02

### Changed

- Updated `@expo/xdl` to 57.9.13 (added \*.bak files clean-up when building .ipa).

## [0.14.12] - 2020-05-14

### Changed

- Update iOS custom client shell app with various fixes.

## [0.14.11] - 2020-05-04

### Changed

- Update SDK 37 iOS shell app with various fixes.

## [0.14.10] - 2020-05-01

### Added

- support for "android.enableDangerousExperimentalLeanBuilds" in app.json.

## [0.14.9] - 2020-04-21

### Changed

- Updated `@expo/xdl` to 57.8.30 (scoped the build command so it only builds the `:app` Android sub-project and not all the sub-projects available, [PR](https://github.com/expo/expo-cli/pull/1937)).

## [0.14.8] - 2020-04-20

### Changed

- Updated `@expo/xdl` to 57.8.29 (removed call to `check-dynamic-macros-android.sh`, [PR](https://github.com/expo/expo-cli/pull/1933)).

## [0.14.7] - 2020-04-20

### Changed

- Turtle no longer installs all dependencies of shell apps projects — only the production dependencies are installed now.
- Updated `@expo/xdl` to 57.8.25 (fixed unintuitive `google-services.json` handling for SDK37+, [PR](https://github.com/expo/expo-cli/pull/1897)).

## [0.14.6] - 2020-04-09

### Changed

- Updated @expo/xdl to 57.8.17 (fixed downloading assets smaller than 10 bytes).

## [0.14.5] - 2020-04-06

### Changed

- Made @expo/config error more meaningful.

## [0.14.4] - 2020-04-06

### Fixed

- Determining SDK version for Expo apps using SDK >=37.

## [0.14.3] - 2020-04-03

### Fixed

- A fix for Android SDK 37 - `check-dynamic-macros-android.sh` doesn't use `jq` anymore.

## [0.14.1] - 2020-04-01

### Changed

- Updated iOS shell app for SDK 37 to remove unnecessary unimodules.

## [0.14.0] - 2020-03-31

### Added

- Added iOS shell app for SDK 37.
- Added Android shell app for SDK 37.

### Changed

- Updated iOS client shell app to support SDK 37.
- Replace `/` with `__` in the artifact filename to fix a strange bug with selecting APK file in Android Studio.
- Print currently using Java version if it's not 8.

### Removed

- Dropped support for SDK 33.

## [0.13.10] - 2020-03-09

### Added

- Added validation for `--public-url`.

### Changed

- Changed the way of installing NDK - it's installed with `sdkmanager` now.
- Upgraded NDK to 17.2.4988734.
- Upgraded Node.js version to 12.16.1.

### Fixed

- A bug where the `platform` field in logs wasn't set correctly when using a shortcut command.
- Removed all remaining instances of `UIWebView` in iOS app builds.

### Removed

- Dropped support for Node.js versions older than 10.
- Dropped support for building Expo SDK 31 and 32 apps.

## [0.13.9] - 2020-02-13

### Fixed

- Fixed Notifications.getDevicePushTokenAsync() erroring occasionally on iOS SDK 36.

## [0.13.8] - 2020-01-27

### Fixed

- Fixed `react-native-maps` native module not being properly initialized (https://github.com/expo/expo/pull/6844)
- Fixed Android standalone apps crashing on startup (https://github.com/expo/expo/pull/6825)

## [0.13.7] - 2020-01-15

### Added

- Bumped `traveling-fastlane` to 1.11.4 to update CA certs

## [0.13.6] - 2019-12-17

### Fixed

- Fixed issue with missing request handler for assets-library urls.

## [0.13.4] - 2019-12-13

### Added

- Support for building iOS apps with a wildcard provisioning profile.

## [0.13.3] - 2019-12-12

### Fixed

- Removed private API usage from iOS SDK 36 tarball

## [0.13.2] - 2019-12-10

### Fixed

- Fixed Android App Bundle builds
- Fixed issue with Root View Background Color and AppLoading on Android SDK 36 builds

## [0.13.1] - 2019-12-09

### Fixed

- Fixed Android shell app for SDK 36

## [0.13.0] - 2019-12-09

### Added

- Added iOS and Android shell apps for SDK 36

### Changed

- Updated iOS client shell app to support SDK 36

## [0.12.12] - 2019-11-22

### Fixed

- A bug that caused `expo.owner` value not to be used if defined.

## [0.12.11] - 2019-11-20

### Added

- Bumped `traveling-fastlane` to 1.11.0

## [0.12.10] - 2019-11-15

### Added

- Add `shellAppSdkVersion` param to `IOSShellAppBuilder` so entitlement keys get properly added in (https://github.com/expo/turtle/pull/162)

## [0.12.9] - 2019-11-14

### Added

- Support for customizing Facebook SDK behavior at buildtime (autoinitialization, logging app events, logging Advertiser ID) (https://github.com/expo/expo/pull/5924)

## [0.12.8] - 2019-10-29

### Changed

- Updated Android shell app for SDK 35 to fix `Linking.openUrl` not opening app if it's already foregrounded (https://github.com/expo/expo/issues/6058)
- Enforce Java 8 when using turtle-cli.

## [0.12.7] - 2019-10-25

### Changed

- Updated Android shell app for SDK 35 to fix occasional crash in background due to GCM registration service (https://github.com/expo/expo/issues/4207)

## [0.12.5] - 2019-10-18

### Changed

- Updated iOS shell app for SDK 35 to fix crash when calling `WebBrowser.dismissBrowser` on iOS 13 (https://github.com/expo/expo/issues/5742)

## [0.12.4] - 2019-10-11

### Changed

- Updated Android shell app for SDK 35 to fix occasional crash on launch (https://github.com/expo/expo/issues/5917)

## [0.12.3] - 2019-10-09

### Changed

- Updated iOS client shell app for SDK 35 to fix it from crashing on startup due to having an incomplete GoogleService-Info.plist file.

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
