import {expect} from "chai";
import EtsyClientV3 from "../../src/EtsyClientV3.js";

const API_KEY = "etsy.key+12:secret[42]";
const ACCESS_TOKEN = "oauth-access-token";

describe("EtsyClientV3 API errors", function () {
    function createClient() {
        return new EtsyClientV3({
            apiKey: API_KEY,
            accessToken: ACCESS_TOKEN,
            apiUrl: "https://etsy.example.test/v3/application"
        });
    }

    async function getRejection(client) {
        let rejection;
        try {
            await client.getListing(123);
        } catch (error) {
            rejection = error;
        }
        return rejection;
    }

    it("preserves Etsy HTTP error details without exposing credentials or response headers", async function () {
        const client = createClient();
        const axiosError = new Error(`Request failed for ${API_KEY} and ${ACCESS_TOKEN}`);
        axiosError.code = "ERR_BAD_REQUEST";
        axiosError.response = {
            status: 403,
            data: {
                error: "invalid_api_key",
                message: `Rejected ${API_KEY}`,
                access_token: ACCESS_TOKEN,
                headers: {"WWW-Authenticate": `Bearer ${ACCESS_TOKEN}`}
            },
            headers: {
                "X-Etsy-Request-Uuid": "etsy-request-uuid",
                "WWW-Authenticate": `Bearer ${ACCESS_TOKEN}`
            }
        };
        client._axios.get = async () => {
            throw axiosError;
        };

        const rejection = await getRejection(client);

        expect(rejection).to.include({
            status: 403,
            code: "ERR_BAD_REQUEST",
            requestId: "etsy-request-uuid"
        });
        expect(rejection.message).to.include("**hidden**");
        expect(rejection.details).to.deep.equal({
            error: "invalid_api_key",
            message: "Rejected **hidden**"
        });
        expect(JSON.stringify(rejection)).not.to.include(API_KEY);
        expect(JSON.stringify(rejection)).not.to.include("etsy-secret");
        expect(JSON.stringify(rejection)).not.to.include(ACCESS_TOKEN);
        expect(JSON.stringify(rejection)).not.to.include("WWW-Authenticate");
        expect(rejection).not.to.have.property("headers");
        expect(rejection).not.to.have.property("config");
    });

    it("preserves Axios network error code and message without response-only fields", async function () {
        const client = createClient();
        const axiosError = new Error(`Network failure for ${ACCESS_TOKEN}`);
        axiosError.code = "ENOTFOUND";
        client._axios.get = async () => {
            throw axiosError;
        };

        const rejection = await getRejection(client);

        expect(rejection).to.include({
            code: "ENOTFOUND",
            message: "Network failure for **hidden**"
        });
        expect(rejection).not.to.have.property("status");
        expect(rejection).not.to.have.property("details");
        expect(rejection).not.to.have.property("requestId");
        expect(JSON.stringify(rejection)).not.to.include(ACCESS_TOKEN);
    });
});
