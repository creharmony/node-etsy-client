import EtsyClientV3 from '../src/EtsyClientV3.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;

const FAKE_API_KEY = "ultraSecretRightHere";
const shop_name = "mony";

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

  });
