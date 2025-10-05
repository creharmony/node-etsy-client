[ < Back](../README.md)

# HowTo Contribute

Please create an [issue](https://github.com/creharmony/node-etsy-client/issues) describing your goal / question / bug description...

If you're interested in an existing issue, please contribute by up-voting for it by adding a :+1:.

If you want to push some code :
- fork and prepare a feature-git-branch, then create a [pull request](https://github.com/creharmony/node-etsy-client/pulls) that link your issue.
- execute tests

You could also be critic with existing ticket/PR : all constructive feedbacks are welcome.

## Basis reminder
Clone this repository from GitHub:

```
$ git clone https://github.com/creharmony/node-etsy-client.git
```

### Prerequisites

1. Install NodeJs (https://nodejs.org/en/download/)
2. Install dependencies
```bash
npm install
```

### Set your own private environment

- study each required environment variable in the [initEnv.example.sh](../env/initEnv.example.sh)
- copy the template in a private file
```bash 
cp ./env/initEnv.example.sh ./env/initEnv.dontpush.sh
. ./env/initEnv.dontpush.sh
```

## HowTo execute tests
* launch tests using `npm test`.

Think about environment setup.


# Maintainer HowTo

## HowTo create a fresh version
- use patch or minor or major workflow

this will make a new version and on version tag, the main ci workflow will push a new npmjs version too.

## HowTo release using `gh`

Install and create automatically a draft release version using [gh client](https://cli.github.com/)
- the version tag must exist

Example to create v2.0.1
```bash
gh release create v2.0.1 --draft --generate-notes
```
this will make a new draft release. Verify it in [releases list](https://github.com/creharmony/node-etsy-client/releases)

- ⚠️ the repository apply immutable releases since v2.0.1, so you can't modify a release once published
- publish the release when ready