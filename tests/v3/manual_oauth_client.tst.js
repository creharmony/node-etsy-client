import winston from 'winston';
import EtsyClientV3 from '../../src/EtsyClientV3.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
chai.should();

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

const display = {
  shopDetail: false,
  shopSections: false,
  allActiveListings: false,
  listings: false,
  listingDetails: false,
  listingImages: false,
  listingInventory: true,
  listingProduct: false
}

// setup debug mode : export ETSY_DEBUG=true

if (apiKey && shopId && accessToken && listingId) {

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
    console.log("*** testConfig", testConfig, "\n\n*** display", display);

    client = new EtsyClientV3(testConfig);

  });

  after(function () {

  });

  describe("Test Authenticated + OAuth EtsyClientV3", function() {

      it("should get shop", async function() {

        logger.info(" - [getShop] get a given shopId", {shopId});
        var getShop = await client.getShop({shopId})
                                  .catch(err =>console.log("getShopSections err", err));

        if (isSet(getShop) && display.shopDetail === true) {
          logger.info(JSON.stringify(getShop, null, 2));
        }

      });

      it("should get shop sections", async function() {

        logger.info(" - [getShopSections] get sections for a given shopId", {shopId});
        var getShopSections = await client.getShopSections({shopId}) // limit doesn't work
                                          .catch(err =>console.log("getShopSections err", err));

        if (isSet(getShopSections) && display.shopSections === true) {
          logger.info(JSON.stringify(getShopSections, null, 2));
        }

      });

      it("should get active listings by shop", async function() {

        logger.info(" - [findAllActiveListingsByShop] get active listings for a given shopId ", {shopId});
        var findAllActiveListingsByShop = await client.findAllActiveListingsByShop({shopId, limit: 3})
                                                      .catch(err =>console.log("findAllActiveListingsByShop err", err));

        if (isSet(findAllActiveListingsByShop) && display.allActiveListings === true) {
          logger.info(JSON.stringify(findAllActiveListingsByShop, null, 2));
        }

      });

      it("should get listings by shop", async function() {

        const state = "active"; // Enum: "active" "inactive" "sold_out" "draft" "expired"
        logger.info(" - [getListingsByShop] get listings for a given shopId and state ", {shopId, state});
        var getListingsByShop = await client.getListingsByShop({shopId, state, limit: 3})
                                             .catch(err =>console.log("getListingsByShop err", err));

        if (isSet(getListingsByShop) && display.listings === true) {
          logger.info(JSON.stringify(getListingsByShop, null, 2));
        }

      });

    if (listingId) {

      it(`should get listing ${listingId} details`, async function() {
        const includes = "images,translations";

        logger.info(" - [getListing] get listing ", {listingId, includes});
        var getListing = await client.getListing(listingId, {includes})
                                     .catch(err =>console.log("getListing err", err));
        if (isSet(getListing) && display.listingDetails === true) {
          logger.info(JSON.stringify(getListing, null, 2));
        }
      });

      it(`should get listing ${listingId} images`, async function() {

        logger.info(" - [getListing] get listing images ", {listingId});
        var getListingImages = await client.getListingImages(listingId, {})
                                     .catch(err =>console.log("getListingImages err", err));
        if (isSet(getListingImages) && display.listingImages === true) {
          logger.info(JSON.stringify(getListingImages, null, 2));
        }
      });

      it(`should get listing ${listingId} inventory`, async function() {

        logger.info(" - [getListingInventory] get listing inventory ", {listingId});
        var getListingInventory = await client.getListingInventory(listingId, {})
                                              .catch(err =>console.log("getListingInventory err", err));
        if (isSet(getListingInventory) && display.listingInventory === true) {
          logger.info(JSON.stringify(getListingInventory, null, 2));
          getListingInventory.products.forEach(product => {
                      logger.info(" product #"+ product.product_id +
                                  ( product.is_deleted ? " *deleted* " : "" ) +
                                  " - offerings:" + product.offerings.length +
                                  " - property_values:"+ product.property_values.length
                      );
            if (!isSet(productId)) {
              productId = product.product_id;
            }
          });

        }
      });

    }

    if (productId !== null) {

      it(`should get listing inventory ${listingId} product`, async function() {

        logger.info(" - [getListingProduct] get listing inventory product", {listingId, productId});
        var getListingProduct = await client.getListingProduct(listingId, productId, {})
                                            .catch(err =>console.log("getListingProduct err", err));
        if (isSet(getListingProduct) && display.listingProduct === true) {
          logger.info(JSON.stringify(getListingProduct, null, 2));
        }
      });

    }

  });

} else {
  console.info("WARNING - wont play oauth client tests without ETSY_TEST_API_KEY ETSY_TEST_SHOP_ID ETSY_TEST_ACCESS_TOKEN ETSY_TEST_LISTING_ID");
}

function isSet(value) {
  return value !== undefined && value !== null && value !== "";
}