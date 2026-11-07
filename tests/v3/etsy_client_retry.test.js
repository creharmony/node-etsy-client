import {expect} from "chai";
import EtsyClientV3 from "../../src/EtsyClientV3.js";

const API_KEY = "etsy.key:secret";

describe("EtsyClientV3 429 retry handling", function () {
    function createClient() {
        return new EtsyClientV3({
            apiKey: API_KEY,
            apiUrl: "https://etsy.example.test/v3/application"
        });
    }

    function rateLimitError(retryAfter) {
        const error = new Error("Too many requests");
        error.code = "ERR_BAD_REQUEST";
        error.response = {
            status: 429,
            data: {error: "rate_limit"},
            headers: retryAfter === undefined ? {} : {"retry-after": retryAfter}
        };
        return error;
    }

    function mockResponses(client, responses) {
        let calls = 0;
        client._axios.get = async () => {
            calls++;
            const response = responses.shift();
            if (response instanceof Error) {
                throw response;
            }
            return response;
        };
        return () => calls;
    }

    it("retries by default using a delta-seconds Retry-After value", async function () {
        const client = createClient();
        const callCount = mockResponses(client, [
            rateLimitError("2"),
            {status: 200, data: {ok: true}}
        ]);
        const delays = [];
        client._waitForRetry = async delayMs => delays.push(delayMs);

        const response = await client.getListing(123);

        expect(response).to.deep.equal({ok: true});
        expect(callCount()).to.equal(2);
        expect(delays).to.deep.equal([2000]);
    });

    it("routes every retry through the configured local rate limiter", async function () {
        const client = createClient();
        const callCount = mockResponses(client, [
            rateLimitError("0"),
            {status: 200, data: {ok: true}}
        ]);
        let limitedCalls = 0;
        client.limiter = {
            limitedCall: async callback => {
                limitedCalls++;
                return callback();
            }
        };
        client._waitForRetry = async () => {};

        await client.getListing(123);

        expect(callCount()).to.equal(2);
        expect(limitedCalls).to.equal(2);
    });

    it("makes at most three attempts in total", async function () {
        const client = createClient();
        const callCount = mockResponses(client, [
            rateLimitError("0"),
            rateLimitError("0"),
            rateLimitError("0")
        ]);
        client._waitForRetry = async () => {};

        let rejection;
        try {
            await client.getListing(123);
        } catch (error) {
            rejection = error;
        }

        expect(callCount()).to.equal(3);
        expect(rejection).to.include({status: 429, code: "ERR_BAD_REQUEST"});
        expect(rejection.details).to.deep.equal({error: "rate_limit"});
    });

    it("does not retry when Retry-After is missing or invalid", async function () {
        for (const retryAfter of [
            undefined,
            "not-a-date",
            "1.5",
            "January 1, 2026",
            "Sun, 06 Nov 1994 08:49:37 GMT",
            "-1"
        ]) {
            const client = createClient();
            const callCount = mockResponses(client, [rateLimitError(retryAfter)]);
            client._waitForRetry = async () => {};

            let rejection;
            try {
                await client.getListing(123);
            } catch (error) {
                rejection = error;
            }

            expect(callCount()).to.equal(1);
            expect(rejection).to.include({status: 429, code: "ERR_BAD_REQUEST"});
        }
    });

    it("does not retry non-429 errors", async function () {
        const client = createClient();
        const error = rateLimitError("0");
        error.response.status = 403;
        const callCount = mockResponses(client, [error]);
        client._waitForRetry = async () => {};

        let rejection;
        try {
            await client.getListing(123);
        } catch (requestError) {
            rejection = requestError;
        }

        expect(callCount()).to.equal(1);
        expect(rejection).to.include({status: 403, code: "ERR_BAD_REQUEST"});
    });
});
