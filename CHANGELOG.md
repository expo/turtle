# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
