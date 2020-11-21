const winston = require('winston');
const winstonTransports = [ new winston.transports.Console({ format: winston.format.simple() }) ];
const logger = winston.createLogger({ transports: winstonTransports });

const EtsyClient = require('./src/EtsyClient.js');
// const EtsyClient = require('node-etsy-client');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function sample_etsy_usage() {
  var client = new EtsyClient();
  var shopOffset = getRandomInt(666);
  var productsLimit = 5;
  var imagesLimit = 5;

  logger.info(" - get 2 first shops after ", {shopOffset});
  var twoShops = await client.getShops({'limit':2, 'offset':shopOffset}).catch((err)=>console.log("getShop err", err));
  logger.debug("twoShops",{twoShops});
  logger.info(" * 2 shops ", {'shop0':twoShops.results[0].shop_name,
                              'shop1':twoShops.results[1].shop_name,
                              'total count':twoShops.count });

  client.shop = twoShops.results[0].shop_name
  logger.info(" - get shop details for ", {'shop':client.shop});
  var shopDetails = await client.getShop().catch((err)=>console.log("getShop err", err));
  logger.info(" * getShop shop_id", {'shopId':shopDetails.results[0].shop_id})

  logger.info(" - get shop active listings ", {'shop':client.shop, 'limit':productsLimit });
  var listOptions = {language:'fr', translate_keywords:true, limit: productsLimit, offset:0};
  var activeListings = await client.getShopActiveListings(listOptions)
        .catch((err)=>console.log("getShopActiveListings err", err));

  if (activeListings.count < 1) {
    logger.info(" x none");
    return;
  }
  activeListings.results.forEach(element => {
    logger.info(" * #"+ element.listing_id+ " ("+ element.quantity + ") " + element.title +
               " - "+ element.price + " " + element.currency_code);
  })

  var listingId = activeListings.results[0].listing_id;
  logger.info(" - get first product related images ", {listingId, 'limit':imagesLimit});
  var firstListingImages = await client.getListingImages(listingId, {limit:imagesLimit})
        .catch((err)=>console.log("getListingImages err", err));
  // console.info("firstListingImages", firstListingImages);
  if (firstListingImages.count < 1) {
    logger.info("no image");
  } else {
    firstListingImages.results.forEach(element => {
      logger.info(" - #"+ element.listing_image_id+ " (" + element.full_height + "x" + element.full_width + ") " +
                 element.url_fullxfull);
    })
  }

}


try {
  sample_etsy_usage();
} catch (exception) {
  logger.error("sample_etsy_usage error", {exception});
}