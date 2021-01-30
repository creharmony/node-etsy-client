const assert = require('assert').strict;
const expect = require('chai').expect
const EtsyClient = require('../src/EtsyClient.js');

if (!process.env.ETSY_API_KEY) {

  describe("Test Unauthenticated EtsyClient", function() {

    it("should not work without api key", async function() {
        expect(function () { new EtsyClient() } ).to.throw('apiKey is required');
    });

  });

}