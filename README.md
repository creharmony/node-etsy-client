# node-etsy-client

[![NPM](https://nodei.co/npm/node-etsy-client.png?compact=true)](https://npmjs.org/package/node-etsy-client)

NodeJs Etsy [REST API](https://www.etsy.com/developers/documentation) Client [V3](https://developers.etsy.com/documentation/).

- compatible with JavaScript and TypeScript.

In addition, this library provide an extra 
- [OAuth2Service](./src/OAuth2Service.js) to manage oAuth2 workflow:
  - build connect url, 
  - handle callback, 
  - and manage refresh token.
  - with an [oauth.js sample](src/sample/oauth.js) to make some oAuth2 manual tests.


## EtsyClientV3
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

using apiKey + OAuth token:
- getListingsByShop
- getListingInventory
- getListingProduct

# Quick start

First declare your api key:
```
export ETSY_API_KEY=xxxxxxxxxxx
```

install node-etsy-client:

```
npm install node-etsy-client
```

then let's go, here is a `sample.js`:
```
import { EtsyClientV3 } from 'node-etsy-client';
async function doIt() {
  var client = new EtsyClientV3();
  var shops = await client.findShops({'shop_name':'mony', limit:10});
  console.log(shops);
}
doIt();
```
You could play Mocha tests to get more examples (cf. next section).

You could avoid using environment variable by using constructor options:
```
var client = new EtsyClientV3({apiKey:'mSecretHere'});
```

## Advanced usage


### Etsy debug mode

To print out in the console the API call and response:
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

| Name      |                                                                   Description                                                                   |
|----------|:-----------------------------------------------------------------------------------------------------------------------------------------------:|
| `apiUrl` |     Etsy API endpoint - (or env.`ETSY_API_ENDPOINT`) default value is (v2)`https://openapi.etsy.com/v2` / (v3)`https://openapi.etsy.com/v3`     |
| `apiKey` | Etsy API key - **required** (or env.`ETSY_API_KEY`) without default value. Ask one from [Etsy portal](https://www.etsy.com/developers/register) |
| `shopId` |                                     Etsy shop id - *optional* (or env.`ETSY_SHOP_ID`) without default value                                     |
| `lang`   |                              Etsy language - *optional* (or env.`ETSY_LANG`) without default value. Example: `fr`                               |
| `ETSY_DRY_MODE`) with default value |                                                                     `false`   |
| `dryMode`   |                  print call instead of making real etsy call - *optional* (or env.`ETSY_DRY_MODE`) with default value: `false`                  |
| `etsyRateWindowSizeMs` |              Rate limit windows size in milliseconds - *optional* (or env.`ETSY_RATE_WINDOWS_SIZE_MS`) with default value: `1000`               |
| `etsyRateMaxQueries` |                    Rate limit max query per windows size - *optional* (or env.`ETSY_RATE_MAX_QUERIES`) without default value                    |

Note about rate limit options:

- rate limit is recommended for V2 client.

- rate limit is enabled if and only if `etsyRateWindowSizeMs` and `etsyRateMaxQueries` are both set.

- if enabled, rate limit on etsy call is max `etsyRateMaxQueries` per `etsyRateWindowSizeMs`ms.

For more details, cf. [susi-rali](https://github.com/creharmony/susi-rali)

### Rate limit
According to [Open API v2 documentation](https://www.etsy.com/developers/documentation/getting_started/api_basics#section_rate_limiting),
Etsy policy was to restricts number of call to 10 per second (and 10k per day).

With [Open API v3](https://developers.etsy.com/documentation/), there is no such restriction so rate limiter is deprecated and disabled by default. 

In order to rate limit calls, node-etsy-client rely on [susi-rali](https://github.com/creharmony/susi-rali)
and offer an option to rate limit client calls.

To apply rate limit of 10 query per seconds (with wait on unavailable slot),
add `etsyRateMaxQueries` option:

```
var client = new EtsyClientV2({apiKey:'mSecretHere', etsyRateMaxQueries:10});
```

## Note about ETSY API versions

Starting from 2.0.0 node-etsy-client provide an `EtsyClientV3` utility class dedicated to etsy 3 api calls.

For previous version (v2 Open API will be discontinued) please rely on node-etsy-client <2.0.0 versions.

During migration from v2 to v3 [#39](https://github.com/creharmony/node-etsy-client/issues/39) some ticket have been created on Etsy OpenAPI side, especially for the `getListing` api:
- `includes` related ticket: etsy/open-api#236 (improvement)
- `variations values translations` related ticket: etsy/open-api#431 (bug)

## How to contribute

cf. [CONTRIBUTING.md](.github/CONTRIBUTING.md)

### Services or activated bots

| badge  | name   | description  |
|--------|-------|:--------|
| ![CI/CD](https://github.com/creharmony/node-etsy-client/workflows/main/badge.svg) |Github actions|Continuous tests + coverage using [c8](https://www.npmjs.com/package/c8).
| [![scheduled npm audit](https://github.com/creharmony/node-etsy-client/actions/workflows/audit.yml/badge.svg)](https://github.com/creharmony/node-etsy-client/actions/workflows/audit.yml) |Github actions|Continuous vulnerability audit.
| [<img src="https://cdn.icon-icons.com/icons2/2148/PNG/512/houndci_icon_132320.png" width="100">](https://houndci.com/)|[Houndci](https://houndci.com/)|JavaScript  automated review (configured by `.hound.yml`)|
|[<img src="https://codetheweb.blog/assets/img/posts/github-pages-free-hosting/cover.png" width="100">](https://creharmony.github.io/node-etsy-client/)| Github pages host some metrics for the main branch of this project: [code coverage](https://creharmony.github.io/node-etsy-client/)
