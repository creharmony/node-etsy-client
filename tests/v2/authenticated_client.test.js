import winston from 'winston';
import EtsyClientV2 from '../../src/EtsyClientV2.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
should();

const winstonTransports = [ new winston.transports.Console({ format: winston.format.simple() }) ];
const logger = winston.createLogger({ transports: winstonTransports });
const productsLimit = 5;
const imagesLimit = 5;

var client;
const apiKey    = process.env.ETSY_TEST_API_KEY;
const shopName  = process.env.ETSY_TEST_SHOP_NAME;
const listingId = process.env.ETSY_TEST_LISTING_ID;

var testPlan = {
  shops: true,
  shopDetails: true,
  shopSections: true,
  shopActiveListings: true,
  shopListingImages:true,
  shopListingShippingInfo:true
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

if (apiKey) {

  before(function () {
    var testConfig = {apiKey};

    if (shopName) {
      testConfig.shop = shopName;
    }

    client = new EtsyClientV2(testConfig);

    console.info("testPlan:", testPlan);
  });

  after(function () {

  });

  describe("Test Authenticated EtsyClientV2", function() {

    if(testPlan.shops) {
      it("should find etsy shops", async function() {

         var shopOffset = getRandomInt(666);

         logger.info(" - [findAllShops] get 2 first shops after ", {shopOffset});
         var twoShops = await client.findAllShops({'limit':2, 'offset':shopOffset})
                                    .catch((err)=>console.log("findAllShops err", err));
         twoShops.should.not.be.empty;
         expect(twoShops.results).to.have.lengthOf(2);
         logger.debug("twoShops",{twoShops});
         logger.info(" * 2 shops ", {'shop0':twoShops.results[0].shop_name,
                                     'shop1':twoShops.results[1].shop_name,
                                     'total count':twoShops.count });

        if (!client.shop) {
          client.shop = twoShops.results[0].shop_name;
        }
      });
    }

    if (testPlan.shopDetails) {
      it("should get shop details", async function() {

         logger.info(" - [getShop] get shop details for ", {'shop':client.shop});
         var shopDetails = await client.getShop()
                                       .catch((err)=>console.log("getShop err", err));
         logger.info(" * getShop shop_id", {'shopId':shopDetails.results[0].shop_id})

      });
    }

    if (testPlan.shopSections) {
      it("should get shop sections", async function() {

        logger.info(" - [findAllShopSections] get shop sections for ", {'shop':client.shop });
        var shopSections = await client.findAllShopSections()
                                        .catch((err)=>console.log("findAllShopSections err", err));
        if (shopSections.count < 1) {
          logger.info(" x none");
        } else {
          shopSections.results.forEach(element => {
            logger.info(" * #"+ element.shop_section_id+ " (rank:"+ element.rank + ") " + element.title +
                       " - count:"+ element.active_listing_count);
          })
        }

      });
    }

    if (testPlan.shopActiveListings) {
      it("should get shop active listing", async function() {

        logger.info(" - [findAllShopListingsActive] get shop active listings ", {'shop':client.shop, 'limit':productsLimit });
        var listOptions = {language:'fr', translate_keywords:true, limit: productsLimit, offset:0};
        var activeListings = await client.findAllShopListingsActive(listOptions)
                                         .catch((err)=>console.log("findAllShopListingsActive err", err));

        if (activeListings.count < 1) {
          logger.info(" x none");
          return;
        }
        activeListings.results.forEach(element => {
          logger.info(" * #"+ element.listing_id+ " ("+ element.quantity + ") " + element.title +
                     " - "+ element.price + " " + element.currency_code);
        })

        if (!listingId) {
          listingId = activeListings.results[0].listing_id;
        }
      });
    }

    if(testPlan.shopListingImages && listingId) {
      it("should get shop listing images", async function() {

        logger.info(" - [findAllListingImages] get first product related images ", {listingId, 'limit':imagesLimit});
        var firstListingImages = await client.findAllListingImages(listingId, {limit:imagesLimit})
                                             .catch((err)=>console.log("findAllListingImages err", err));
        // console.info("firstListingImages", firstListingImages);
        if (firstListingImages.count < 1) {
          logger.info("no image");
        } else {
          firstListingImages.results.forEach(element => {
            logger.info(" - #"+ element.listing_image_id+ " (" + element.full_height + "x" + element.full_width + ") " +
                       element.url_fullxfull);
          })
        }

      });
    }

    if(testPlan.shopListingShippingInfo && listingId) {
      it("should get shop listing shipping info", async function() {

        logger.info(" - [findAllListingShippingProfileEntries] get first product related shipping info ", {listingId});
        var findAllListingShippingProfileEntries = await client.findAllListingShippingProfileEntries(listingId, {})
                                             .catch((err)=>console.log("findAllListingShippingProfileEntries err", err));
        // console.info("findAllListingShippingProfileEntries", findAllListingShippingProfileEntries);
        if (findAllListingShippingProfileEntries.count < 1) {
          logger.info("no shipping info");
        } else {
          findAllListingShippingProfileEntries.results.forEach(element => {
            logger.info(" - from "+ element.origin_country_name+ " => to " + element.destination_country_name + " \tprimary cost:" + element.primary_cost +
                       " " + element.currency_code + " (secondary:" + element.secondary_cost + " " + element.currency_code);
          })
        }

      });
    }

  });

} else {
  console.info("WARNING - wont play authenticated client tests without ETSY_TEST_API_KEY");
}