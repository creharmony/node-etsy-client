import winston from 'winston';
import EtsyClientV3 from '../../src/EtsyClientV3.js';

import chai from 'chai';

const should = chai.should;
const expect = chai.expect;
chai.should();

const winstonTransports = [new winston.transports.Console({format: winston.format.simple()})];
const logger = winston.createLogger({transports: winstonTransports});
const productsLimit = 5;
const imagesLimit = 5;

let client;
const apiKey = process.env.ETSY_TEST_API_KEY;
const shopName = process.env.ETSY_TEST_SHOP_NAME;
const shopId = process.env.ETSY_TEST_SHOP_ID;
let listingId = null; //  "1011358134";

const testPlan = {
    shops: true,
    shopDetails: true,
    shopSections: true,
    shopReviews: true,
    shopActiveListings: true,
    shopListing: true,
    shopListingVariationImages: true,
    shopListingImages: true,
    shopListingProperties: true,
    shopListingShippingInfo: true
};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

if (apiKey) {

    before(function () {
        const testConfig = {apiKey};

        if (shopName) {
            testConfig.shop = shopName;
        }
        if (shopId) {
            testConfig.shopId = shopId;
        }

        client = new EtsyClientV3(testConfig);

        console.info("testPlan:", testPlan);
    });

    after(function () {

    });

    describe('🧪🧩 > ' + import.meta.url.split('/').pop(), function () {

        if (testPlan.shops) {
            it("should find etsy shops", async function () {

                const shop_name = "mony";
                logger.info(" - [findShops] get shops by name ", {shop_name});
                const twoShops = await client.findShops({shop_name, 'limit': 2})
                    .catch(err => console.log("findShops err", err));
                twoShops.should.not.be.empty;
                expect(twoShops.results).to.have.lengthOf(2);
                logger.debug("twoShops", {twoShops});
                logger.info(" * 2 shops ", {
                    'shop0': twoShops.results[0].shop_name,
                    'shop1': twoShops.results[1].shop_name,
                    'total count': twoShops.count
                });

                if (!client.shop) {
                    client.shop = twoShops.results[0].shop_name;
                }
            });
        }

        if (testPlan.shopDetails) {
            it("should get shop details", async function () {

                logger.info(" - [getShop] get shop details for ", {'shopId': client.shopId});
                var shopDetails = await client.getShop()
                    .catch(err => console.log("getShop err", err));
                logger.info(" * getShop shop_name", {'shop_name': shopDetails.shop_name})

            });
        }

        if (testPlan.shopSections) {
            it("should get shop sections", async function () {

                logger.info(" - [getShopSections] get shop sections for ", {'shopId': client.shopId});
                const shopSections = await client.getShopSections()
                    .catch(err => console.log("getShopSections err", err));
                if (shopSections.count < 1) {
                    logger.info(" x none");
                } else {
                    shopSections.results.forEach(element => {
                        logger.info(" * #" + element.shop_section_id + " (rank:" + element.rank + ") " + element.title +
                            " - count:" + element.active_listing_count);
                    })
                }

            });
        }

        if (testPlan.shopReviews) {
            it("should get shop reviews", async function () {

                logger.info(" - [getShopReviews] get shop reviews for ", {'shopId': client.shopId});
                const shopReviews = await client.getShopReviews()
                    .catch(err => console.log("getShopReviews err", err));
                if (shopReviews.count < 1) {
                    logger.info(" x none");
                } else {
                    console.log(JSON.stringify(shopReviews.results, null, 2));
                }

            });
        }

        if (testPlan.shopActiveListings) {
            it("should get shop active listings", async function () {

                logger.info(" - [findAllActiveListingsByShop] get shop active listings ", {
                    'shopId': client.shopId,
                    'limit': productsLimit
                });
                const listOptions = {language: 'fr', translate_keywords: true, limit: productsLimit, offset: 0};
                const activeListings = await client.findAllActiveListingsByShop(listOptions)
                    .catch(err => console.log("findAllActiveListingsByShop err", err));

                if (activeListings.count < 1) {
                    logger.info(" x none");
                    return;
                }
                activeListings.results.forEach(element => {
                    logger.info(" * #" + element.listing_id + " (" + element.quantity + ") " + element.title +
                        " - " + element.price.amount / element.price.divisor + " " + element.price.currency_code);
                })

                listingId = listingId === null ? activeListings.results[0].listing_id : listingId;
            });
        }

        if (testPlan.shopListing) {
            it("should get shop listing", async function () {

                logger.info(" - [getListing] get shop listing ", {'listingId': listingId});
                const listOptions = {};
                const listing = await client.getListing(listingId, listOptions)
                    .catch(err => console.log("getListing err", err));

                if (!listing) {
                    logger.info(" x none");
                    return;
                }
                console.info("getListing", JSON.stringify(listing));
                logger.info(" * #" + listing.listing_id + " (" + listing.quantity + ") " + listing.title +
                    " - " + listing.price.amount / listing.price.divisor + " " + listing.price.currency_code);

            });
        }

        if (testPlan.shopListingVariationImages) {
            it("should get shop listing variation images", async function () {

                logger.info(" - [getListingVariationImages] get first product related images ", {
                    listingId,
                    'limit': imagesLimit
                });
                const getListingVariationImages = await client.getListingVariationImages(listingId, {limit: imagesLimit})
                    .catch(err => console.log("getListingVariationImages err", err));
                // console.info("getListingVariationImages", getListingVariationImages);
                if (getListingVariationImages.count < 1) {
                    logger.info("no image");
                } else {
                    getListingVariationImages.results.forEach(element => {
                        logger.info(" - prop#" + element.property_id + " value#" + element.value_id + " >" + element.value + " image #" + element.image_id);
                    })
                }

            });
        }

        if (testPlan.shopListingImages) {
            it("should get shop listing images", async function () {

                logger.info(" - [getListingImages] get first product related images ", {
                    listingId,
                    'limit': imagesLimit
                });
                const getListingImages = await client.getListingImages(listingId, {limit: imagesLimit})
                    .catch(err => console.log("getListingImages err", err));
                // console.info("getListingImages", getListingImages);
                if (getListingImages.count < 1) {
                    logger.info("no image");
                } else {
                    getListingImages.results.forEach(element => {
                        logger.info(" - #" + element.listing_image_id + " (" + element.full_height + "x" + element.full_width + ") " +
                            element.url_fullxfull);
                    })
                }

            });
        }

        if (testPlan.shopListingProperties) {
            it("should get shop listing properties", async function () {

                logger.info(" - [getListingProperty] get first product related properties ", {listingId});
                const getListingProperty = await client.getListingProperty(listingId, {'shopId': client.shopId})
                    .catch(err => console.log("getListingImages err", err));
                // console.info("getListingProperty", getListingProperty);
                if (getListingProperty.count < 1) {
                    logger.info("no prop");
                } else {
                    getListingProperty.results.forEach(element => {
                        logger.info("property:" + JSON.stringify(element));
                    })
                }

            });
        }

    });

} else {
    console.info("WARNING - wont play authenticated client tests without ETSY_TEST_API_KEY");
}