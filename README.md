# node-etsy-client
NodeJs Etsy [ReST API](https://www.etsy.com/developers/documentation) Client

# Quick start

First declare your api key :
```
export ETSY_API_KEY=xxxxxxxxxxx
```

then this is a `sample.js`:
```
const EtsyClient = require('node-etsy-client')
async function doIt() {
  var client = new EtsyClient();
  var shops = await client.getShops({'limit':10});
  console.log(shops);
}
doIt();
```

You coud avoid using environment variable by using constructor options: 
```
var client = new EtsyClient({apiKey:'mSecretHere'});
```

Look at more [Example.js](Example.js) on how to use.