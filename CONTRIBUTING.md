# Contributing to Turtle CLI

## How to contribute
You can contribute to Turtle CLI in various ways, including:
- [Reporting bugs or issues](https://github.com/expo/turtle/issues/new) on GitHub. Please make sure to fill in all the details suggested by the template to make sure the issue can be addressed as quickly as possible.
- [Submitting improvements to the documentation](https://github.com/expo/expo/tree/master/docs). Updates, enhancements, new guides, spelling fixes…
- Helping other people on [Expo Forums](https://forums.expo.io/) and on [Expo Developers Slack](http://slack.expo.io).
- Looking at existing [issues](https://github.com/expo/turtle/issues) and adding more information, particularly helping to reproduce the issues.
- [Submitting a pull request](#submitting-a-pull-request) with a bug fix or an improvement.

## Turtle CLI repository

### Codebase
This repository contains the codebase for the `turtle-cli` NPM package. The same codebase is used to run standalone app builders on the Expo servers.

### Branches
The `master` branch of the repository should be kept releasable at any time. This way we can continuously release fixes and improvements without costly managing of different branches and issues will be noticed and fixed quickly. This also ensures other contributors can check out the latest version from GitHub and work on it with minimal disruption from other features in progress.

## Submitting a pull request
To submit a pull request:
1. Fork the [repository](https://github.com/expo/turtle) and create a feature branch. (Existing contributors can create feature branches without forking. Prefix the branch name with `@your-github-username/`.)
2. Write the description of your pull request. Make sure to include a test plan and test your changes.
3. Make sure all tests pass on CircleCI.
4. Wait for a review and adjust the code if necessary.

## Publishing a release
- To release a new version of `turtle-cli`, run `yarn release` command.
- If you wish to release a new *beta* version of `turtle-cli`, run `yarn release:beta` instead.
- Update [Changelog](CHANGELOG.md).
- In a terminal, `cd` into [expo/turtle-cli-example](https://github.com/expo/turtle-cli-example) repository, run `yarn update-turtle-cli-version` (this script updates `turtle-cli` version number in CI configuration files and commits the changes) and then run `git push`. Thanks!
