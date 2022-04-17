import { EtsyClientV3 } from '../../../lib/export.js'; // node-etsy-client';

async function doIt() {
  try {
    const client = new EtsyClientV3();
    const shops = await client.findShops({'shop_name':'mony', limit:10})
                            .catch( (err:any) => console.error(err));
    if (shops) {
      console.log(JSON.stringify(shops, null, 2));
    }
  } catch (error) {
    console.error("ERROR", error);
  }
}

console.log('TypeScript project')
doIt();

