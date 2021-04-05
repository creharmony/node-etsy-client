const assert = require('assert').strict;
const expect = require('chai').expect
const EtsyClient = require('../src/EtsyClient.js');

const FAKE_API_KEY = "ultraSecretRightHere";

if (!process.env.ETSY_API_KEY && "1" === process.env.ETSY_LONG_TEST) {

  describe("Test rate limit", function() {
    it("should dry test cases with rate limit of 10 per seconds for 200 queries", async function() {
      const start = new Date();
      const max = 10;
      const nbEntries = 200;
      const client = new EtsyClient({apiKey:"oo", dryMode:true, etsyRateMaxQueries:max});
      for (i=0;i<nbEntries;i++) {
        await client.findAllShops().catch(_expectNoError);
      }
      const duration = new Date() - start;
      const expectedTimeMs = (nbEntries/max)*1000   ;
      expect(duration).to.be.within(expectedTimeMs-100, expectedTimeMs+500);
    });

  });
}

function _expectNoError(err) {
  console.trace(err)
  expect.fail(err);
}
