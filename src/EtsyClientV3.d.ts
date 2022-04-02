declare module 'node-etsy-client' {
  type EtsyClientOptions = Partial<{
    apiUrl: string;
    apiKey: string;
    lang: string;
    shopId: number;
  }>

  export default class EtsyClientV3 {
    constructor(options?: EtsyClientOptions);

    findShops(options?: EtsyClientOptions): Promise<string | object>;

    getShop(options?: EtsyClientOptions): Promise<string | object>;

    getShopSections(npoptions?: EtsyClientOptions): Promise<string | object>;
   /**
    * Finds all active Listings associated with a Shop.
    * 
    * (NOTE: If calling on behalf of a shop owner in the context of listing
    * management, be sure to include the parameter `include_private: true`.
    * This will return private listings that are not publicly visible in the
    * shop, but which can be managed. This is an experimental feature and may
    * change.)
    */
   findAllActiveListingsByShop(options?: Partial<{
     limit: number;
     offset: number;
     shop_id: number | string;
     keywords: string;
     sort_on: object;
     sort_order: object;
   }>): Promise<string | object>;
 
   getListing(listingId: number, options?: object): Promise<string | object>;
 
   getListingVariationImages(listingId: number, options?: object): Promise<string | object>;
 
   getListingImages(listingId: number, options?: object): Promise<string | object>;

   getListingProperty(listingId: number, options?: object): Promise<string | object>;

   getListingsByShop(options?: EtsyClientOptions): Promise<string | object>;

   getListingInventory(listingId: number, options?: object): Promise<string | object>;

   getListingProduct(listingId: number, productId: number, options?: object): Promise<string | object>;

   getOptions(options: EtsyClientOptions): EtsyClientOptions;
  }
}
