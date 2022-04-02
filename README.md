# node-etsy-client

[![NPM](https://nodei.co/npm/node-etsy-client.png?compact=true)](https://npmjs.org/package/node-etsy-client)

NodeJs Etsy [ReST API](https://www.etsy.com/developers/documentation) Client ([V2](https://www.etsy.com/developers/documentation/getting_started/api_basics#reference), [V3](https://developers.etsy.com/documentation/)).

- compatible with JavaScript and TypeScript.

In addition, this library provide an extra 
- [OAuth2Service](./src/OAuth2Service.js) to manage oAuth2 workflow:
  - build connect url, 
  - handle callback, 
  - and manage refresh token.
  - with an [oauth.js sample](src/sample/oauth.js) to make some oAuth2 manual tests.

## EtsyClientV3 - *BETA*
Features

using apiKey:
- findShops
- getShop
- getShopSections
- findAllActiveListingsByShop
- getListing
- getListingVariationImages
- getListingImages
- getListingProperty

using apiKey + oauth token:
- getListingsByShop
- getListingInventory
- getListingProduct

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
const EtsyClientV3 = require('node-etsy-client')
async function doIt() {
  var client = new EtsyClientV3();
  var shops = await client.findShops({'shop_name':'mony', limit':10});
  console.log(shops);
}
doIt();
```
You could play mocha tests to get more examples (cf. next section).

You could avoid using environment variable by using constructor options:
```
var client = new EtsyClientV3({apiKey:'mSecretHere'});
```

## Advanced usage


### Etsy debug mode

To print out in the console the api call and response:
```bash
export ETSY_DEBUG=true
```

### Etsy client options
This section describes EtsyClientV2/EtsyClientV3 available options.

Note about options precedence: 
- first take option value from constructor if any, 
- or else try to retrieve related environment variable, 
- or else apply default value.

Options:
- `apiUrl` : Etsy api endpoint - (or env.`ETSY_API_ENDPOINT`) default value is (v2)`https://openapi.etsy.com/v2` / (v3)`https://openapi.etsy.com/v3`.
- `apiKey` : Etsy api key - **required** (or env.`ETSY_API_KEY`) without default value. Ask one from [Etsy portal](https://www.etsy.com/developers/register).
- (v2)`shop`   : Etsy shop name - *optional* (or env.`ETSY_SHOP`) without default value.
- (v3)`shopId` : Etsy shop id - *optional* (or env.`ETSY_SHOP_ID`) without default value.
- `lang`   : Etsy language - *optional* (or env.`ETSY_LANG`) without default value. Example: `fr`.
- `ETSY_DRY_MODE`) with default value: `false`.
- `dryMode`              : print call instead of making real etsy call - *optional* (or env.`ETSY_DRY_MODE`) with default value: `false`.
-`etsyRateWindowSizeMs` : Rate limit windows size in milliseconds - *optional* (or env.`ETSY_RATE_WINDOWS_SIZE_MS`) with default value: `1000`
- `etsyRateMaxQueries`   : Rate limit max query per windows size - *optional* (or env.`ETSY_RATE_MAX_QUERIES`) without default value

Note about rate limit options:

- rate limit is enabled if and only if `etsyRateWindowSizeMs` and `etsyRateMaxQueries` are both set.

- if enabled, rate limit on etsy call is max `etsyRateMaxQueries` per `etsyRateWindowSizeMs`ms.

For more details, cf. [susi-rali](https://github.com/creharmony/susi-rali)

### Rate limit
According to [their documentation](https://www.etsy.com/developers/documentation/getting_started/api_basics#section_rate_limiting),
Etsy restricts number of call to 10 per second (and 10k per day).

In order to never reach this (second windows) rate limit, node-etsy-client rely on [susi-rali](https://github.com/creharmony/susi-rali)
and offer an option to rate limit client calls.

To apply rate limit of 10 query per seconds (with wait on unavailable slot),
add `etsyRateMaxQueries` option:

```
var client = new EtsyClientV2({apiKey:'mSecretHere', etsyRateMaxQueries:10});
```

## ETSY API versions

| node-etsy-client<br/>version |   Classes    | Etsy API  |
|------------------------------|:------------:|:-----------------|
| &gt;= 1.0.0                  | EtsyClientV3 |               V3 |
| &gt;= 1.0.0                  | EtsyClientV2 |               V2 |
| 0.x.y                        |  EtsyClient  |               V2 |

Starting from 1.0.0-beta node-etsy-client provide an `EtsyClientV3` utility class dedicated to etsy 3 api calls.

For previous version < 1.0.0 (eg. `0.8.2`) node-etsy-client was providing only one utility class called `EtsyClient` which was dedicated to etsy v2 api calls. This class has been renamed into `EtsyClientV2`.

Etsy v2 API will remain unavailable for a given amount of time in 2022 :

- **WARNING** : v2 API will be discontinued : cf Etsy [migration page for more details](https://developers.etsy.com/documentation/migration/index#launch-stages)
- planned EtsyClientV2 cleanup : [#41](https://github.com/creharmony/node-etsy-client/issues/41) to produce node-etsy-client v2


### EtsyClientV2 (deprecated)


Features

- findAllShops(shop_name)
- getShop
- getShopSections
- findAllActiveListingsByShop
- getListing
- getListingVariationImages
- getListingImages
- getListingProperty



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
# play test without etsy endpoint
npm run test
# play test with etsy endpoint
. ./env/initEnv.example.sh
npm run test
```
* you could also fork, feature branch, then submit a pull request.

### Services or activated bots

| badge  | name   | description  |
|--------|-------|:--------|
| ![CI/CD](https://github.com/creharmony/node-etsy-client/workflows/etsy_client_ci/badge.svg) |Github actions|Continuous tests + coverage using [c8](https://www.npmjs.com/package/c8).
| [![scheduled npm audit](https://github.com/creharmony/node-etsy-client/actions/workflows/audit.yml/badge.svg)](https://github.com/creharmony/node-etsy-client/actions/workflows/audit.yml) |Github actions|Continuous vulnerability audit.
|  |[Houndci](https://houndci.com/)|JavaScript  automated review (configured by `.hound.yml`)|
| [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)|[gren](https://github.com/github-tools/github-release-notes)|[Release notes](https://github.com/creharmony/node-etsy-client/releases) automation|
<!-- travis disabled
| [![Build Status](https://travis-ci.com/creharmony/node-etsy-client.svg?branch=main)](https://travis-ci.com/creharmony/node-etsy-client) |[Travis-ci](https://travis-ci.com/creharmony/node-etsy-client)|Continuous tests.
-->
