import EtsyClientV3 from '../../src/EtsyClientV3.js';
import OAuth2Service from '../../src/OAuth2Service.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
chai.should();

const FAKE_API_KEY = "ultraSecretRightHere";
const FAKE_TOKEN   = "ultraSecretRightHereBis";
const shop_name = "mony";

if (!process.env.ETSY_API_KEY) {

  describe("Test Unauthenticated EtsyClientV3", function() {

    it("should not work without api key", async function() {
        expect(function () { new EtsyClientV3() } ).to.throw('apiKey is required');
    });

    it("should not report api key in error case", async function() {
      const client = new EtsyClientV3({
        apiTimeoutMs: 100,
        apiKey:FAKE_API_KEY,
        accessToken:FAKE_TOKEN,
        apiUrl:"https://IAmNotEtsyEndpoint.com",
        shopId:123456
      });
      const shops = await client.getListingsByShop()
        .catch(findShopsError => {
          expect(""+findShopsError).to.not.include(FAKE_API_KEY);
        })
    });

    it("should not report api key in error case (with rate limit)", async function() {
      const client = new EtsyClientV3({
        apiKey:FAKE_API_KEY,
        accessToken:FAKE_TOKEN,
        apiUrl:"https://IAmNotEtsyEndpoint.com",
        etsyRateMaxQueries:10,
        shopId:123456
      });
      const shops = await client.getListingsByShop()
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

      const getListingEn = await client.getListing(listingId, {"lang":"en"}).catch(_expectNoError);
      expect(getListingEn.endpoint).to.be.eql(expectedEnEndpoint(`/listings/${listingId}`));

      const getListingImagesEn = await client.getListingImages(listingId, {"lang":"en"}).catch(_expectNoError);
      expect(getListingImagesEn.endpoint).to.be.eql(expectedEnEndpoint(`/listings/${listingId}/images`));
    });

    //~ oauth2

    it("should provide oAuth2 connect url", async function() {
      const oauth = new OAuth2Service();
      const client_id = FAKE_API_KEY;
      const redirect_uri = "https://www.exemple.com/mycallback";

      // WHEN
      const result = oauth.authenticate(client_id/*etsy api key*/, redirect_uri);

      console.log(JSON.stringify(result, null, 2));

      expect(result).to.have.property('state');
      expect(result).to.have.property('codeVerifier');
      expect(result).to.have.property('connectUrl');

      expect(result.connectUrl).to.include("https%3A%2F%2Fwww.exemple.com%2Fmycallback");;
      expect(result.connectUrl).to.include(FAKE_API_KEY);;
      expect(result.connectUrl).to.include("response_type=code");;
    });

    it("should try error asking oAuth2 token", async function() {
      const oauth = new OAuth2Service();
      const client_id = FAKE_API_KEY;
      const code = "wrong one";
      const code_verifier = "yet another fake one";
      const redirect_uri = "https://www.exemple.com/mycallback";

      // WHEN
      const result = await oauth.askForApiV3Token(client_id/*etsy api key*/, code, code_verifier, redirect_uri)
                                .catch(err => {

      console.log(JSON.stringify(err, null, 2));

      expect(err).to.have.property('error');
      expect(err.error).to.be.eql("Invalid API key");;

                                });
                                console.log("pouet");
    });

    it("should try error asking to refresh oAuth2 token", async function() {
      const oauth = new OAuth2Service();
      const client_id = FAKE_API_KEY;
      const refresh_token = "yet another fake one";

      // WHEN
      const result = await oauth.refreshApiV3Token(client_id/*etsy api key*/, refresh_token)
                                .catch(err => {

      console.log(JSON.stringify(err, null, 2));

      expect(err).to.have.property('error');
      expect(err.error).to.be.eql("Invalid API key");;

                                });
    });

  });
}

function enrichOptionsWithTestConfiguration(options) {
  options.apiKey = FAKE_API_KEY;
  options.apiTimeoutMs = 100;
  options.apiUrl = "https://IAmNotEtsyEndpoint.com";
  options.shop = "MyShop";
  options.shopId = "321123";
  options.lang = "fr";
  return options;
}

function _expectNoError(err) {
  console.trace(err);
  expect.fail(err);
}
