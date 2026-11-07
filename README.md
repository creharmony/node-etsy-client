# node-etsy-client

[![NPM](https://nodei.co/npm/node-etsy-client.png?compact=true)](https://npmjs.org/package/node-etsy-client)

Node.js client for the Etsy [REST API v3](https://developers.etsy.com/documentation/).

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
- getListingsByListingIds

using apiKey + OAuth token:
- getListingsByShop
- getListingInventory
- getListingProduct
- getMe
- getShopReceipts
- getShopReceipt
- getShopReceiptTransactionsByReceipt
- getShopReceiptTransactionsByShop
- getListingsInventoryByListingIds

# Quick start

Requires Node.js 22 or later.

First declare your api key:
```
export ETSY_API_KEY=your_key:your_secret
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
var client = new EtsyClientV3({apiKey:'your_key:your_secret'});
```

## Advanced usage


### Etsy debug mode

To print out in the console the API call and response:
```bash
export ETSY_DEBUG=true
```

### ApiKey format and Silence API key format warning

> ⚠️ **Important: API Key Format Change (January 18, 2026)**  
> Starting January 18, 2026, Etsy requires all API keys to include a shared secret.  
> Format: `keystring:shared_secret` (e.g., `export ETSY_API_KEY=your_key:your_secret`)  
> Find your shared secret at: https://www.etsy.com/developers/your-apps  
> Documentation: https://developer.etsy.com/documentation/essentials/requests
>
> If your API key doesn't include the `:` separator, you'll see a warning message.  
> To silence this warning: `export ETSY_SILENT_API_KEY_WARNING=true`

If you're still using the old API key format (without shared secret) and want to suppress the warning message:
```bash
export ETSY_SILENT_API_KEY_WARNING=true
```

Note: This is temporary - you must migrate to the new format before January 18, 2026.

### Etsy client options
This section describes the `EtsyClientV3` options.

Note about options precedence: 
- first take option value from constructor if any, 
- or else try to retrieve related environment variable, 
- or else apply default value.

Options:

| Name                   | Description                                                                                                                |
|------------------------|:---------------------------------------------------------------------------------------------------------------------------|
| `apiUrl`               | Etsy API v3 endpoint (or env.`ETSY_API_ENDPOINT`); defaults to `https://openapi.etsy.com/v3/application`                   |
| `apiKey`               | Etsy API key - **required** (or env.`ETSY_API_KEY`), format: `keystring:shared_secret` (*)                                 |
| `shopId`               | Etsy shop id - *optional* (or env.`ETSY_SHOP_ID`)                                                                          |
| `lang`                 | Etsy language - *optional* (or env.`ETSY_LANG`). Example: `fr`                                                            |
| `dryMode`              | Print calls instead of making real Etsy calls - *optional* (or env.`ETSY_DRY_MODE`), defaults to `false`                  |
| `etsyRateWindowSizeMs` | Optional rate-limit window size in milliseconds (or env.`ETSY_RATE_WINDOWS_SIZE_MS`); defaults to `1000`                  |
| `etsyRateMaxQueries`   | Optional maximum queries per rate-limit window (or env.`ETSY_RATE_MAX_QUERIES`); unset by default                          |

(*) shared_secret is mandatory from Jan 18, 2026. Ask one from [Etsy portal](https://www.etsy.com/developers/register).

### Rate limiting

An optional client-side rate limiter is enabled when both `etsyRateWindowSizeMs` and `etsyRateMaxQueries`
are set. It limits calls to the configured number of queries per window. For example, to limit the client
to 10 queries per second:

```
var client = new EtsyClientV3({
  apiKey: 'your_key:your_secret',
  etsyRateWindowSizeMs: 1000,
  etsyRateMaxQueries: 10
});
```

The client also retries Etsy `429 Too Many Requests` responses by default, up to three attempts total.
It waits for a valid non-negative integer in the `Retry-After` header (seconds, as described in the
[Etsy Rate Limits documentation](https://developers.etsy.com/documentation/essentials/rate-limits/)).
If the header is missing or invalid, the `429` error is returned without retrying. Other errors are not retried.

## How to contribute

cf. [CONTRIBUTING.md](.github/CONTRIBUTING.md)

### Services or activated bots

![CI/CD](https://github.com/creharmony/node-etsy-client/workflows/main/badge.svg) **Github actions** - Continuous tests + coverage using [c8](https://www.npmjs.com/package/c8)

[![scheduled npm audit](https://github.com/creharmony/node-etsy-client/actions/workflows/audit.yml/badge.svg)](https://github.com/creharmony/node-etsy-client/actions/workflows/audit.yml) **Github actions** - Continuous vulnerability audit

**[Houndci](https://houndci.com/)** - JavaScript automated review (configured by `.hound.yml`)

**[Github pages](https://creharmony.github.io/node-etsy-client/)** - Host metrics for main branch: [code coverage](https://creharmony.github.io/node-etsy-client/)
