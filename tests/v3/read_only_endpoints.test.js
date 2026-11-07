import {expect} from "chai";
import EtsyClientV3 from '../../src/EtsyClientV3.js';

const API_URL = "https://etsy.example.test/v3/application";
const API_KEY = "fake-api-key:fake-secret";
const ACCESS_TOKEN = "fake-access-token";
const SHOP_ID = 123456;

describe('🧪🧩 > read-only Etsy API v3 endpoint wrappers', function () {
    let client;

    beforeEach(function () {
        client = new EtsyClientV3({
            apiKey: API_KEY,
            accessToken: ACCESS_TOKEN,
            apiUrl: API_URL,
            shopId: SHOP_ID,
            lang: 'fr',
            dryMode: true
        });
    });

    it('calls getMe with the authenticated user endpoint', async function () {
        const result = await client.getMe();

        expect(result.endpoint).to.equal(`${API_URL}/users/me?language=fr`);
    });

    it('calls shop receipt endpoints with IDs and query options', async function () {
        const receiptId = 987654;

        const receipts = await client.getShopReceipts({limit: 5, offset: 10});
        expect(receipts.endpoint).to.equal(`${API_URL}/shops/${SHOP_ID}/receipts?language=fr&limit=5&offset=10`);

        const receipt = await client.getShopReceipt(receiptId, {includes: 'Transactions'});
        expect(receipt.endpoint).to.equal(`${API_URL}/shops/${SHOP_ID}/receipts/${receiptId}?includes=Transactions&language=fr`);

        const receiptTransactions = await client.getShopReceiptTransactionsByReceipt(receiptId, {limit: 3});
        expect(receiptTransactions.endpoint).to.equal(
            `${API_URL}/shops/${SHOP_ID}/receipts/${receiptId}/transactions?language=fr&limit=3`
        );

        const shopTransactions = await client.getShopReceiptTransactionsByShop({limit: 7});
        expect(shopTransactions.endpoint).to.equal(`${API_URL}/shops/${SHOP_ID}/transactions?language=fr&limit=7`);
    });

    it('sends listing ID arrays as Etsy comma-separated query parameters', async function () {
        const options = {listing_ids: [123, 456], limit: 2};

        const listings = await client.getListingsByListingIds(options);
        expect(listings.endpoint).to.equal(`${API_URL}/listings/batch?language=fr&limit=2&listing_ids=123%2C456`);
        expect(options.listing_ids).to.deep.equal([123, 456]);

        const inventory = await client.getListingsInventoryByListingIds({listing_ids: [123, 456]});
        expect(inventory.endpoint).to.equal(
            `${API_URL}/listings/batch/inventory?language=fr&listing_ids=123%2C456`
        );
    });

    it('requires OAuth for endpoints that need an authenticated user', function () {
        const unauthenticatedClient = new EtsyClientV3({apiKey: API_KEY, apiUrl: API_URL, shopId: SHOP_ID, dryMode: true});

        expect(() => unauthenticatedClient.getMe()).to.throw('accessToken is not defined');
        expect(() => unauthenticatedClient.getShopReceipts()).to.throw('accessToken is not defined');
        expect(() => unauthenticatedClient.getListingsInventoryByListingIds({listing_ids: [123]}))
            .to.throw('accessToken is not defined');
    });

    it('requires listing IDs for batch endpoints', function () {
        expect(() => client.getListingsByListingIds()).to.throw('listing_ids is required');
        expect(() => client.getListingsInventoryByListingIds({listing_ids: []}))
            .to.throw('listing_ids must be a non-empty array');
    });
});
