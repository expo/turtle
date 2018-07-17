# Turtle

## Useful links

- [Queues statistics (Datadog dashboard)](https://app.datadoghq.com/screen/342034/turtle-queues?live=true)
- [Sentry project](https://sentry.io/expoio/turtle-js/?environment=production)
- [Builds logs (Loggly)](https://exponent.loggly.com/)
- [#tmnt (slack channel)](slack://channel?team=T1QLCLN30&id=C7ZTEVBB3)
- [#turtle-builds (temporary slack channel for comparing results of Go and JS builders)](slack://channel?team=T1QLCLN30&id=CAV54RKCN)
- [Troubleshooting](#Troubleshooting)

## What is Turtle?

Turtle is a Node.js microservice which builds users' standalone apps. It fetches build jobs from AWS SQS queue (input queue), processes them and uploads builds artifacts (and logs) to AWS S3. Turtle is used to build both Android and iOS apps. During a build process, Turtle sends notifications about the progress to the www service over another AWS SQS queue (output queue). In the future, we'll also provide users with a command line tool which will enable them to build Expo standalone apps on their own CI services without being dependent on our system (it's still a work in progress).

## Deployment

### iOS

iOS builders are deployed to MacStadium cluster, deployment process is managed by Terraform. Because we must be connected to the VPN to perform a successful deployment, there is no easy way to setup appropriate process on CircleCI. Therefore, currently all deployments have to be performed from a local machine.

Terraform configuration for iOS builders lives in `terraform/turtle-js.tf` file. There are two instances of `turtle-js` module defined - one for staging and one for production. Each instance has two important variables: `agent_commit` and `shell_commit`. `agent_commit` tells terraform from which commit it should take Turtle JS code. On the other hand, `shell_commit` tells from which commit Terraform should take precompiled iOS shell app.

If you ever need to upgrade `fastlane` version on builders, you should change `new_fastlane_staging` or `new_fastlane_production` local variable in the same file.

To perform a successful deploy to staging (for production, just replace `staging` with `production`), follow these steps:
- edit `terraform/turtle-js.tf`: change `agent_commit` and/or `shell_commit` variables in `module.turtle_js_staging`
- connect to the VPN
- run: `cd $EXPO_UNIVERSE_DIR/terraform`
- check the terraform plan: `terraform plan -target module.turtle_js_staging`
- if sure the plan is correct, apply changes with: `terraform apply -target module.turtle_js_staging` (you will be prompted to type `yes` to confirm changes)
- commit and push changes in `terraform/turtle-js.tf` to `master`

*Optional step:*

*If you're releasing a new SDK, make sure to run `pt update-turtle-sdk-version --sdk X.0.0 --platform ios`. Versions object is being updated on staging, to move it to the production, use `pt promote-versions-to-prod`.*

### Android

Android builders are deployed to k8s cluster, deployment process is managed by CircleCI (which runs appropriate `kubectl` commands). Currently all commits pushed to `master` branch trigger a deployment of new Turtle JS code to staging. To update Android shell app as well, you have to put the appropriate S3 URL to `shellTarballs/android` file (+ commit and push your changes). S3 URL to the Android shell app can be obtained from logs of a `shell_app_base_android` job (CircleCI). To promote some commit (Turtle version) to production, you have to unblock `new_turtle_android_approve_production` job (CircleCI) for this commit.

To perform a successful deploy to staging (and then to production), follow these steps:
- if you want to upgrade Android shell app:
  * go to CircleCI, find appropriate `shell_app_base_android` job and find S3 URL in logs
  * put S3 URL to `shellTarballs/android` file and commit your changes
  * wait for `new_turtle_android_build` job to finish
- to deploy turtle to staging, just push your changes to `master` branch, deployment will start automatically
- after making sure your changes are safe to push them to production, find `new_turle` workflow on CircleCI and unblock `new_turtle_android_approve_production` job

*Optional step:*

*If you're releasing a new SDK, make sure to run `pt update-turtle-sdk-version --sdk X.0.0 --platform android`. Versions object is being updated on staging, to move it to the production, use `pt promote-versions-to-prod`.*

## Development

### Prerequisites

- Working `www` service, check another [README](../www/README.md)
- Turtle fetches build jobs from AWS SQS queues. Therefore if you want to develop Turtle on your local machine, you have to create your own queues. To achieve it, you have to add another instance of `turtle-queues` in `terraform/aws_sqs.tf` file. How to do it?
  * Add new `turtle-queues` module instance `terraform/aws_sqs.tf`.
  * Set `module` name to `turtle_queues_local_${YOUR_NICKNAME_HERE}`.
  * Set `environment` variable to `local_${YOUR_NICKNAME_HERE}`.
  * Save file, run `cd $EXPO_UNIVERSE_DIR/terraform` and then `terraform init` (to initialize new module).
  * Check a terraform plan: `terraform plan -target module.turtle_queues_local_${YOUR_NICKNAME_HERE}`.
  * If you're sure the plan is correct, apply changes with: `terraform apply -target module.turtle_js_staging` (you will be prompted to type `yes` to confirm changes).
  * Commit and push changes to `master` branch.

### Setup

- Run `update-local-secrets` to populate the `.secrets` files used for local configuration. You'll need to run this any time a secret used for configuring Turtle is changed and pushed to Google Cloud Storage (which shouldn't be very often)
- Run `yarn secrets:init-private ${YOUR_NICKNAME_HERE}` in `server/turtle` directory to init your private secrets (with your queues urls).
- Run `yarn` to install node modules.
- Run `yarn start:ios` or `yarn start:android` to run Turtle.

### Local development

Turtle uses Redis to get notifications (from www) about builds cancellations. To make this feature working, you have to use the same Redis instance as www. Therefore, you need to remember about starting www before starting Turtle. If you forget about it, don't worry, Turtle will remind you to run `yarn start-docker` in `server/www` directory.

Turtle uploads build artifacts to S3. This could take some time if you have poor internet connection. To facilitate local development, there is a feature which allows Turtle to fake artifact upload. `secrets:init-private` script, which you should have run while setting up Turtle, sets fake upload directory to your user's default Downloads directory (we're assuming you're using Mac). If you need to test uploading artifacts to S3, you have to edit `.secrets.local` file and comment or remove `TURTLE_FAKE_UPLOAD` and `TURTLE_FAKE_UPLOAD_DIR` environment variables.

## Command line tool (WIP)

We want to make Turtle an open-source project some day and provide users with a command line tool which will enable them to build Expo standalone apps on their own. They won't need to use `exp` tool and they won't be dependent on our system's stability.

Code for the command line tool lives in `src/bin` directory. Even though the project is still a work in progress, most of the desired functionalities are already implemented. We still have to make sure we can safely open-source this project and we have to come up with process of publishing npm package.

## Troubleshooting

### Connecting to iOS builders (via SSH)
- Connect to the VPN
- Run `yarn ssh:ios:ips $ENV` (`ENV` can be either set to `production` or `staging`) to obtain virtual machines IPs.
- Run `ssh expo@IP` to connect to the appropriate VM (ask @nicknovitski or @dsokal for the password).
- Run `tail -f turtle-js.log` to show Turtle logs.

### Connecting to Android builders (via SSH)
- Run `yarn ssh:android:pods-names $ENV` (`ENV` can be either set to `production` or `staging`) to get k8s pods names.
- Run `yarn ssh:connect $ENV $POD_NAME` to connect to the appropriate pod.
