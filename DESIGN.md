# Shell Apps Infrastructure (CODENAME 🐢) Design Document

## Objective
To allow building of Exponent Shell Applications "in the cloud", and then allow the shipping of those applications to the iOS App Store and Google Play Store.

## High Level Overview
The general concept of Exponent is that we're able to deliver experiences in two ways. Currently, when a developer publishes their experience to [exp.host](exp.host), we're able to serve that experience through the Exponent client on iOS and Android. This is possible due to the underlying architecture of Exponent -- a developer writes JS and JS only, and all Exponent developers use the same underlying native modules and the same React Native code. In addition, due to the ability of Exponent to support multiple ABI versions, we can reliably run our developer's experiences on different Exponent client versions and know that we will not break any experience that isn't updated to support new ABI versions. This allows us to ship new copies of Exponent quicker and more confidently.

🐢 extends the current Exponent offering to allow standalone copies of a developer's application to be deployed to the iOS App Store and Google Play Store. These standalone copies are "shell apps", in that they contain React Native, the core Exponent kernel, and are specifically configured to not show the Exponent "home screen", and immediatley download and start the developer's experience from [exp.host](exp.host). (do we also put a copy of the bundle in the shell app?)

Shell apps, because they contain the entire Exponent kernel, are also able to open other Exponent experiences (by following an "exp://" url) (this is a future feature).

## Workflow

- Developer runs `exp build` in their project directory.
  - Options:
    - release [default: latest] -- Specify the version or id of the release to build
    - platform [default: all] -- Specify the platform to build. By default, both an IPA and APK will be generated.
  - [Future Improvement] Add "Build" button to XDE.
- If needed, XDL will publish a new release to exp.host, and then trigger a new "build" (server-side) for that release.

## Architecture

### Technology

- RethinkDB
  - Database
- Redis
  - Cache and Message queue
- Golang
  - For build agent that runs on Linux and Mac OS X
- GraphQL
  - Instead of REST, we will expose the current state of the shell apps infrastructure over GraphQL
- Koa
  - Web server
- Kubernetes
  - Scheduler for Docker containers
- Vault [https://www.vaultproject.io/](https://www.vaultproject.io/)
  - Use the "transit" backend to securely encrypt secret data (such as user credentials for App Store and Play Store).
- Docker
  - All pieces of the infrastructure run within Docker, with the exception of the OSX build process (for signing iOS)

## User Stories

| Story                                                                                | Feature            |
|--------------------------------------------------------------------------------------|--------------------|
| As a developer, I should be able to initialize the creation of a shell app from XDE. | Shell App Creation |
