const assert = require('assert').strict;
const expect = require('chai').expect
const EtsyClient = require('../src/EtsyClient.js');

const FAKE_API_KEY = "ultraSecretRightHere";

if (!process.env.ETSY_API_KEY) {

  describe("Test Unauthenticated EtsyClient", function() {

    it("should not work without api key", async function() {
        expect(function () { new EtsyClient() } ).to.throw('apiKey is required');
    });

    it("should not report api key in error case", async function() {
      const client = new EtsyClient({
        apiKey:FAKE_API_KEY,
        apiUrl:"https://IAmNotEtsyEndpoint.com"
      });
      const shops = await client.findAllShops()
        .catch((getShopsError) => {
          expect(""+getShopsError).to.not.include(FAKE_API_KEY);
        })
    });

    // 11 test cases (>10)
    async function api_test_cases(etsyExtraOptions) {
      var etsyOptions = etsyExtraOptions;
      const apiKey = FAKE_API_KEY;
      const apiUrl = "https://IAmNotEtsyEndpoint.com";
      const shop = "MyShop";
      const lang = "fr";
      const listingId = "12345665432";
      const productId = "34555555555";

      etsyOptions.apiKey = apiKey;
      etsyOptions.apiUrl = apiUrl;
      etsyOptions.shop = shop;
      etsyOptions.lang = lang;

      const client = new EtsyClient(etsyOptions);
      const expectedEndpoint = (path) => `${apiUrl}${path}?api_key=${apiKey}&language=${lang}`;

      const findAllShops = await client.findAllShops().catch(_expectNoError);
      expect(findAllShops.endpoint).to.be.eql(expectedEndpoint("/shops"));

      const getShop = await client.getShop().catch(_expectNoError);
      expect(getShop.endpoint).to.be.eql(expectedEndpoint(`/shops/${shop}`));

      const findAllShopSections = await client.findAllShopSections().catch(_expectNoError);
      expect(findAllShopSections.endpoint).to.be.eql(expectedEndpoint(`/shops/${shop}/sections`));

      const findAllShopListingsActive = await client.findAllShopListingsActive().catch(_expectNoError);
      expect(findAllShopListingsActive.endpoint).to.be.eql(expectedEndpoint(`/shops/${shop}/listings/active`));

      const getListing = await client.getListing(listingId).catch(_expectNoError);
      expect(getListing.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}`));

      const getVariationImages = await client.getVariationImages(listingId).catch(_expectNoError);
      expect(getVariationImages.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}/variation-images`));

      const findAllListingImages = await client.findAllListingImages(listingId).catch(_expectNoError);
      expect(findAllListingImages.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}/images`));

      const getInventory = await client.getInventory(listingId).catch(_expectNoError);
      expect(getInventory.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}/inventory`));

      const getAttributes = await client.getAttributes(listingId).catch(_expectNoError);
      expect(getAttributes.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}/attributes`));

      const getProduct = await client.getProduct(listingId, productId).catch(_expectNoError);
      expect(getProduct.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}/products/${productId}`));

      if ("etsyRateWait" in etsyOptions && etsyOptions.etsyRateWait === false) {
              await client.findAllListingShippingProfileEntries(listingId)
              .catch((rateLimitError) => {
                expect(rateLimitError).to.be.eql("rate limit reached");
              })
      } else {
          const findAllListingShippingProfileEntries = await client.findAllListingShippingProfileEntries(listingId).catch(_expectNoError);
          expect(findAllListingShippingProfileEntries.endpoint).to.be.eql(expectedEndpoint(`/listings/${listingId}/shipping/info`));
      }
    }

    it("should dry test cases without rate limit", async function() {
      const start = new Date()
      await api_test_cases({dryMode:true})
      const duration = new Date() - start;
      expect(duration).to.be.lt(500);
    });

    it("should dry test cases with rate limit of 10 per seconds", async function() {
      const start = new Date()
      await api_test_cases({dryMode:true, etsyRateMaxQueries:10})
      const duration = new Date() - start;
      expect(duration).to.be.gt(1000);
    });

    it("should dry test cases with rate limit of 10 per seconds without wait", async function() {
      await api_test_cases({dryMode:true, etsyRateMaxQueries:10, etsyRateWait:false});
    });

  });
}

function _expectNoError(err) {
  console.trace(err)
  expect.fail(err);
}
