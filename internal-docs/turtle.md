# Turtle

## Useful links

- [Monitoring (Datadog dashboard)](https://app.datadoghq.com/screen/342034/turtle-queues?live=true)
- [Sentry project](https://sentry.io/expoio/turtle-js/?environment=production)
- [Builds logs (Loggly)](https://exponent.loggly.com/)
- [#tmnt (slack channel)](slack://channel?team=T1QLCLN30&id=C7ZTEVBB3)
- [Troubleshooting](#Troubleshooting)

## Deployment

### iOS

iOS builders are deployed to MacStadium cluster, deployment process is managed by Terraform. Because we must be connected to the VPN to perform a successful deployment, there is no easy way to setup appropriate process on CircleCI. Therefore, currently all deployments have to be performed from a local machine.

Terraform configuration for iOS builders lives in `terraform/turtle-js.tf` file. There are two instances of `turtle-js` module defined - one for staging and one for production. Each module instance has `agent_commit` variable defined. It tells terraform from which commit it should take Turtle JS code (and iOS shell apps linked to it).

If you ever need to upgrade `fastlane` version on builders, you should change `fastlane_staging` or `fastlane_production` local variable in the same file.

To update iOS shell app as well, you have to put the appropriate S3 URL to the  `shellTarballs/ios/sdkXX` file (+ commit and push your changes). S3 URL to the iOS shell app can be obtained from logs of a `shell_app_sdk_XX_ios_upload` job (CircleCI).

To perform a successful deploy to staging (for production, just replace `staging` with `production`), follow these steps:
- if you want to upgrade iOS shell app:
  * go to CircleCI, find `shell_app` workflow for a commit from which you want to build a shell app and unlock `shell_app_approve_build` job
  * once the `shell_app_sdk_latest_ios_upload` job has finished, find S3 URL to the shell app in its logs
  * put S3 URL to `shellTarballs/ios/sdkXX` file and commit your changes
  * wait for `turtle_agent_mac` job to finish
- edit `terraform/turtle-js.tf`: change `agent_commit` variable in `module.turtle_js_staging`
- connect to the VPN
- run: `cd $EXPO_UNIVERSE_DIR/terraform`
- run: `nix-shell`
- check the terraform plan: `terraform plan -target module.turtle_js_staging`
- if sure the plan is correct, apply changes with: `terraform apply -target module.turtle_js_staging` (you will be prompted to type `yes` to confirm changes)
- commit and push changes in `terraform/turtle-js.tf` to `master`

Optional steps:

**If you're releasing a new SDK**, make sure to run `pt update-turtle-sdk-version --sdk X.0.0 --platform ios`. Versions object is being updated on staging, to move it to the production, use `pt promote-versions-to-prod`.*

### Android

Android builders are deployed to k8s cluster, deployment process is managed by CircleCI (which runs appropriate `kubectl` commands). Currently all commits pushed to `master` branch trigger a deployment of new Turtle JS code to staging. To update Android shell app as well, you have to put the appropriate S3 URL to `shellTarballs/android` file (+ commit and push your changes). S3 URL to the Android shell app can be obtained from logs of a `shell_app_base_android` job (CircleCI). To promote some commit (Turtle version) to production, you have to unblock `turtle_android_approve_production` job (CircleCI) for this commit.

To perform a successful deploy to staging (and then to production), follow these steps:
- if you want to upgrade Android shell app:
  * go to CircleCI, find appropriate `shell_app_base_android_new` job and find S3 URL in logs
  * put S3 URL to `shellTarballs/android` file and commit your changes
  * wait for `turtle_android_build` job to finish
- to deploy turtle to staging, just push your changes to `master` branch, deployment will start automatically
- after making sure your changes are safe to push them to production, find `turtle` workflow on CircleCI and unblock `turtle_android_approve_production` job

*Optional step:*

*If you're releasing a new SDK, make sure to run `pt update-turtle-sdk-version --sdk X.0.0 --platform android`. Versions object is being updated on staging, to move it to the production, use `pt promote-versions-to-prod`.*

## Development

### Prerequisites

- Working `www` service, check another [README](../www/README.md)
- Turtle fetches build jobs from AWS SQS queues. Therefore if you want to develop Turtle on your local machine, you have to create your own queues. To achieve it, you have to add another instance of `turtle-queues` in `terraform/aws_sqs.tf` file. How to do it?
  * Add new `turtle-queues` module instance `terraform/aws_sqs.tf`.
  * Set `module` name to `turtle_queues_local_${YOUR_NICKNAME_HERE}`.
  * Set `environment` variable to `local_${YOUR_NICKNAME_HERE}`.
  * Save file, run `cd $EXPO_UNIVERSE_DIR/terraform` and then `nix-shell`.
  * Check a terraform plan: `terraform plan -target module.turtle_queues_local_${YOUR_NICKNAME_HERE}`.
  * If you're sure the plan is correct, apply changes with: `terraform apply -target module.turtle_queues_local_${YOUR_NICKNAME_HERE}` (you will be prompted to type `yes` to confirm changes).
  * Commit and push changes to `master` branch.

#### Generating iOS shell app

- Go to `exponent/tools-public` directory.
- Build iOS shell app for standalone (archive) builds with `gulp ios-shell-app --action build --type archive --verbose true --skipRepoUpdate`
- Build iOS shell app for simulator builds with `gulp ios-shell-app --action build --type simulator --verbose true --skipRepoUpdate`
- Don't worry. Even though these commands usually take long time to finish (an hour or two), you'll rarely have to rebuild iOS shell app.

### Setup

- Run `update-local-secrets` to populate the `.secrets` files used for local configuration. You'll need to run this any time a secret used for configuring Turtle is changed and pushed to Google Cloud Storage (which shouldn't be very often)
- Run `yarn init-workingdir:local` in `server/turtle` directory to initialize Turtle's working directory. This script create symlinks to the shell app from `exponent` directory.
- Run `yarn secrets:init-private ${YOUR_NICKNAME_HERE}` in `server/turtle` directory to init your private secrets (with your queues urls).
- Run `yarn` to install node modules.
- Run `yarn set-priorities:local` to set priorities' configuration. This is not mandatory, but you'll get a lot of annoying messages without this.
- Run `yarn start:ios` or `yarn start:android` to run Turtle.

**Additional step:**
Also, you have to remember to point your local www server to use the same AWS SQS queues which are used by Turtle. To do that, edit `server/www/secrets.local` and add there `AWS_SQS_ANDROID_QUEUE_URL`, `AWS_SQS_IOS_QUEUE_URL` and `AWS_SQS_OUT_QUEUE_URL` env variables, which you can find in `server/turtle/secrets.local` file.

### Local development

Turtle uses Redis to get notifications (from www) about builds cancellations. To make this feature working, you have to use the same Redis instance as www. Therefore, you need to remember about starting www before starting Turtle. If you forget about it, don't worry, Turtle will remind you to run `yarn start-docker` in `server/www` directory.

Turtle uploads build artifacts to S3. This could take some time if you have poor internet connection. To facilitate local development, there is a feature which allows Turtle to fake artifact upload. `secrets:init-private` script, which you should have run while setting up Turtle, sets fake upload directory to your user's default Downloads directory (we're assuming you're using Mac). If you need to test uploading artifacts to S3, you have to edit `.secrets.local` file and comment or remove `TURTLE_FAKE_UPLOAD` and `TURTLE_FAKE_UPLOAD_DIR` environment variables.

## Troubleshooting

### Connecting to iOS builders (via SSH)
- Connect to the VPN
- Run `yarn ssh:ios:ips $ENV` (`ENV` can be either set to `production` or `staging`) to obtain virtual machines IPs.
- Run `ssh expo@IP` to connect to the appropriate VM (ask @nicknovitski or @dsokal for the password).
- Run `tail -f turtle-js.log` to show Turtle logs.

### Connecting to Android builders (via SSH)
- Run `yarn ssh:android:pods-names $ENV` (`ENV` can be either set to `production` or `staging`) to get k8s pods names.
- Run `yarn ssh:connect $ENV $POD_NAME` to connect to the appropriate pod.

## Testing
- both platforms: `yarn test:smoke`
- single platform: `yarn test:smoke:android` or `yarn test:smoke:ios` 

### Generating recording files for smoke tests

Smoke tests are powered by `Nock` which uses JSON files which contain responses to the HTTP requests fired by the build process.

To record new responses remove old `recording.json` and start test and manually schedule build with `expo-cli` tool.
As a precaution, remember to revoke Apple certificates that were used for the build after recording HTTP requests/responses with `Nock`.
