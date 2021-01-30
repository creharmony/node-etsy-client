# node-etsy-client

[![NPM](https://nodei.co/npm/node-etsy-client.png?compact=true)](https://npmjs.org/package/node-etsy-client)

NodeJs Etsy [ReST API](https://www.etsy.com/developers/documentation) Client.

- compatible with JavaScript and TypeScript.

Features

- findAllShops
- getShop
- findAllShopSections
- findAllShopListingsActive 
- getListing
- getVariationImages
- findAllListingImages
- getInventory 
- getAttributes
- getProduct
- findAllListingShippingProfileEntries

# Quick start

First declare your api key :
```
export ETSY_API_KEY=xxxxxxxxxxx
```

install node-etsy-client

```
npm install node-etsy-client
```

then let's go, here is a `sample.js`:
```
const EtsyClient = require('node-etsy-client')
async function doIt() {
  var client = new EtsyClient();
  var shops = await client.getShops({'limit':10});
  console.log(shops);
}
doIt();
```
You could play mocha tests to get more examples (cf. next section).

You could avoid using environment variable by using constructor options:
```
var client = new EtsyClient({apiKey:'mSecretHere'});
```

## How to contribute
You're not a dev ? just submit an issue (bug, improvements, questions). Or else:
* Clone
* Install deps
* setup your test environment (cf. [initEnv.example.sh](./env/initEnv.example.sh))
* Then mocha tests
```
git clone https://github.com/creharmony/node-etsy-client.git
cd node-etsy-client
npm install
. ./env/initEnv.example.sh
npm run test
```
* you could also fork, feature branch, then submit a pull request.

### Services or activated bots

| badge  | name   | description  |
|--------|-------|:--------|
| [![Build Status](https://travis-ci.com/creharmony/node-etsy-client.svg?branch=main)](https://travis-ci.com/creharmony/node-etsy-client) |[Travis-ci](https://travis-ci.com/creharmony/node-etsy-client)|Continuous tests.
|  |[Houndci](https://houndci.com/)|JavaScript  automated review (configured by `.hound.yml`)|
| [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)|[gren](https://github.com/github-tools/github-release-notes)|[Release notes](https://github.com/creharmony/node-etsy-client/releases) automation|
