import winston from 'winston';
import EtsyClientV3 from '../../src/EtsyClientV3.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
should();

const winstonTransports = [ new winston.transports.Console({ format: winston.format.simple() }) ];
const logger = winston.createLogger({ transports: winstonTransports });
const productsLimit = 5;
const imagesLimit = 5;

var client;
const apiKey      = process.env.ETSY_TEST_API_KEY;
const accessToken = process.env.ETSY_TEST_ACCESS_TOKEN;
const shopName    = process.env.ETSY_TEST_SHOP_NAME;
const shopId      = process.env.ETSY_TEST_SHOP_ID;
var listingId     = process.env.ETSY_TEST_LISTING_ID;
var productId     = process.env.ETSY_TEST_PRODUCT_ID;


// setup debug mode : export ETSY_DEBUG=true

if (apiKey && accessToken) {

  before(function () {
    var testConfig = {apiKey};

    if (shopName) {
      testConfig.shop = shopName;
    }
    if (shopId) {
      testConfig.shopId = shopId;
    }
    if (accessToken) {
      testConfig.accessToken = accessToken;
    }
    console.log("testConfig",testConfig);

    client = new EtsyClientV3(testConfig);

  });

  after(function () {

  });

  describe("Test Authenticated + OAuth EtsyClientV3", function() {

      it("should get listings by shop", async function() {

        const state = "active"; // Enum: "active" "inactive" "sold_out" "draft" "expired"
        logger.info(" - [getListingsByShop] get listings for a given shopId and state ", {shopId, state});
        var getListingsByShop = await client.getListingsByShop({shopId, state})
                                             .catch(err =>console.log("getListingsByShop err", err));

        // first test with scope=['shops_r','listings_r'] -
        // err: Could not find a shop for user with user_id = xxxx // etsy bug ???

        if (isSet(getListingsByShop)) {
          logger.info(JSON.stringify(getListingsByShop, null, 2));
        }

      });

    if (listingId) {

      it(`should get listing inventory ${listingId}`, async function() {

        logger.info(" - [getListingInventory] get listing inventory ", {listingId});
        var getListingInventory = await client.getListingInventory(listingId, {})
                                             .catch(err =>console.log("getListingInventory err", err));
        if (isSet(getListingInventory)) {
          // logger.info(JSON.stringify(getListingInventory, null, 2));
          getListingInventory.products.forEach(product => {
                      logger.info(" product #"+ product.product_id +
                                  ( product.is_deleted ? " *deleted* " : "" ) +
                                  " - offerings:" + product.offerings.length +
                                  " - property_values:"+ product.property_values.length
                      );
          });
        }
      });

    }

    if (productId !== null) {

      it(`should get listing inventory ${listingId} product ${productId}`, async function() {

        logger.info(" - [getListingProduct] get listing inventory product", {listingId, productId});
        var getListingProduct = await client.getListingProduct(listingId, productId, {})
                                            .catch(err =>console.log("getListingProduct err", err));
        if (isSet(getListingProduct)) {
          logger.info(JSON.stringify(getListingProduct, null, 2));
        }
      });

    }

    logger.info(" productId",productId)

  });

} else {
  console.info("WARNING - wont play oauth client tests without ETSY_TEST_API_KEY ETSY_TEST_ACCESS_TOKEN ETSY_TEST_LISTING_ID");
}

function isSet(value) {
  return value !== undefined && value !== null && value !== "";
}