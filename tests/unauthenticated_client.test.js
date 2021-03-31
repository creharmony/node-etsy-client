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

  });

}