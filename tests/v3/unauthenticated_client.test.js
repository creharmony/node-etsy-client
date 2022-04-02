import EtsyClientV3 from '../../src/EtsyClientV3.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
should();

const FAKE_API_KEY = "ultraSecretRightHere";
const shop_name = "mony";

if (!process.env.ETSY_API_KEY) {

  describe("Test Unauthenticated EtsyClientV3", function() {

    it("should not work without api key", async function() {
        expect(function () { new EtsyClientV3() } ).to.throw('apiKey is required');
    });

    it("should not report api key in error case", async function() {
      const client = new EtsyClientV3({
        apiKey:FAKE_API_KEY,
        apiUrl:"https://IAmNotEtsyEndpoint.com"
      });
      const shops = await client.findShops({shop_name})
        .catch(findShopsError => {
          expect(""+findShopsError).to.not.include(FAKE_API_KEY);
        })
    });

    // 11 test cases (>10)
    async function api_test_cases(etsyExtraOptions = {}) {
      const etsyOptions = enrichOptionsWithTestConfiguration(etsyExtraOptions);
      const apiUrl = etsyOptions.apiUrl;
      const apiKey = etsyOptions.apiKey;
      const lang = etsyOptions.lang;
      const shop = etsyOptions.shop;
      const shopId = etsyOptions.shopId;
      const listingId = "12345665432";
      const productId = "34555555555";

      const client = new EtsyClientV3(etsyOptions);
      const expectedEndpoint = (path, extra='') => `${apiUrl}${path}?language=${lang}${extra}`;

      const findShops = await client.findShops({shop_name}).catch(_expectNoError);
      expect(findShops.endpoint).to.be.eql(expectedEndpoint("/shops","&shop_name=mony"));

      const getShop = await client.getShop().catch(_expectNoError);
      expect(getShop.endpoint).to.be.eql(expectedEndpoint(`/shops/${shopId}`));

      const getShopSections = await client.getShopSections().catch(_expectNoError);
      expect(getShopSections.endpoint).to.be.eql(expectedEndpoint(`/shops/${shopId}/sections`));

      const findAllActiveListingsByShop = await client.findAllActiveListingsByShop().catch(_expectNoError);
      expect(findAllActiveListingsByShop.endpoint).to.be.eql(expectedEndpoint(`/shops/${shopId}/listings/active`));

      const getListing = await client.getListing(listingId).catch(_expectNoError);
      expect(getListing.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}`));

      const getListingVariationImages = await client.getListingVariationImages(listingId).catch(_expectNoError);
      expect(getListingVariationImages.endpoint).to.be.eql(expectedEndpoint(`/shops/${shopId}/listings/${listingId}/variation-images`));

      const getListingImages = await client.getListingImages(listingId).catch(_expectNoError);
      expect(getListingImages.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}/images`));

      await client.getListingImages(listingId).catch(_expectNoError);
      await client.getListingImages(listingId).catch(_expectNoError);
      await client.getListingImages(listingId).catch(_expectNoError);//10

      if ("etsyRateWait" in etsyOptions && etsyOptions.etsyRateWait === false) {
              await client.getListingProperty(listingId)
              .catch((rateLimitError) => {
                expect(rateLimitError).to.be.eql("rate limit reached");
              })
      } else {
          const properties = await client.getListingProperty(listingId).catch(_expectNoError);
          expect(properties.endpoint).to.be.eql(expectedEndpoint(`/shops/${shopId}/listings/${listingId}/properties`));
      }
    }

    it("should dry test cases without rate limit", async function() {
      const start = new Date()
      await api_test_cases({dryMode:true})
      const duration = new Date() - start;
      expect(duration).to.be.lt(500);
    });

    it("should dry test cases with rate limit of 7 per seconds", async function() {
      const start = new Date()
      await api_test_cases({dryMode:true, etsyRateMaxQueries:10})
      const duration = new Date() - start;
      expect(duration).to.be.gt(1000);
    });

    it("should fetch with default client lang or query lang if any", async function() {
      const etsyOptions = enrichOptionsWithTestConfiguration({dryMode:true});
      const client = new EtsyClientV3(etsyOptions);

      const listingId = "12345665432";
      const apiUrl = etsyOptions.apiUrl;
      const apiKey = etsyOptions.apiKey;
      const lang = etsyOptions.lang;
      const expectedFrEndpoint = (path) => `${apiUrl}${path}?language=${lang}`;
      const expectedEnEndpoint = (path) => `${apiUrl}${path}?language=en`;

      //~ language is defined in client options

      const getListingFr = await client.getListing(listingId).catch(_expectNoError);
      expect(getListingFr.endpoint).to.be.eql(expectedFrEndpoint(`/listings/${listingId}`));

      const getListingImagesFr = await client.getListingImages(listingId).catch(_expectNoError);
      expect(getListingImagesFr.endpoint).to.be.eql(expectedFrEndpoint(`/listings/${listingId}/images`));

      //~ language is defined in query-specific options

      const getListingEn = await client.getListing(listingId, {"language":"en"}).catch(_expectNoError);
      expect(getListingEn.endpoint).to.be.eql(expectedEnEndpoint(`/listings/${listingId}`));

      const getListingImagesEn = await client.getListingImages(listingId, {"language":"en"}).catch(_expectNoError);
      expect(getListingImagesEn.endpoint).to.be.eql(expectedEnEndpoint(`/listings/${listingId}/images`));
    });

  });
}

function enrichOptionsWithTestConfiguration(options) {
  options.apiKey = FAKE_API_KEY;
  options.apiUrl = "https://IAmNotEtsyEndpoint.com";
  options.shop = "MyShop";
  options.shopId = "321123";
  options.lang = "fr";
  return options;
}

function _expectNoError(err) {
  console.trace(err instanceof String ? err : JSON.stringify(err))
  expect.fail(err);
}