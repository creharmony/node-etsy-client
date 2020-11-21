const assert = require('assert').strict;
const expect = require('chai').expect
const EtsyClient = require('../src/EtsyClient.js');

describe("EtsyClient", function() {
    var client;

    it("should not work without api key", async function() {
        expect(function () { new EtsyClient() } ).to.throw('apiKey is required');
    });

});