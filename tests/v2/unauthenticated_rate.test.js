import EtsyClientV2 from '../../src/EtsyClientV2.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
chai.should();

const FAKE_API_KEY = "ultraSecretRightHere";

if (!process.env.ETSY_API_KEY && "1" === process.env.ETSY_LONG_TEST) {

  describe("Test rate limit", function() {
    it("should dry test cases with rate limit of 10 per seconds for 200 queries", async function() {
      const start = new Date();
      const max = 10;
      const nbEntries = 200;
      const client = new EtsyClientV2({apiKey:"oo", dryMode:true, etsyRateMaxQueries:max});
      for (var i=0;i<nbEntries;i++) {
        await client.findAllShops().catch(_expectNoError);
      }
      const duration = new Date() - start;
      const expectedTimeMs = (nbEntries/max)*1000;// 20 sec : 200 / 10 entries per second
      expect(duration).to.be.within(expectedTimeMs-100, expectedTimeMs+5000);// with additional time because upper limit is not strict
    });

  });
}

function _expectNoError(err) {
  console.trace(err)
  expect.fail(err);
}
