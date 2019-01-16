# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- turtle version is added to onFinish and onError build messages
### Removed
- `--push-p12-path` parameter for `turtle build:ios` command,
a Push Notifications Certificate is no longer required to perform a successful
iOS standalone app build.
- new/old turtle version build argument

## [0.4.3] - 2019-01-09
### Changed
- Update iOS shell app for SDK32.
- Update Android shell app for SDK32.
