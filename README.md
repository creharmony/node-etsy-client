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

You could avoid using environment variable by using constructor options: 
```
var client = new EtsyClient({apiKey:'mSecretHere'});
```

You could play mocha tests to get more examples.
- clone
- `npm install`
- setup your test environment (cf. [initEnv.example.sh](./env/initEnv.example.sh))  
- run mocha tests : `npm run test`