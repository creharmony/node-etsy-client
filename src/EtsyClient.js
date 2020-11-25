const queryString = require('query-string');
const fetch = require("node-fetch");

/**
 * this utility class implement ETSY (some) methods documented here:
 * https://www.etsy.com/developers/documentation > API Reference
 **/
class EtsyClient {

  static debug = process.env.ETSY_DEBUG && process.env.ETSY_DEBUG === true;

  constructor(options) {
    if (!options) {
      options = {};
    }
    this.apiUrl = process.env.ETSY_API_ENDPOINT || 'https://openapi.etsy.com/v2'
    this.apiKey = process.env.ETSY_API_KEY || options.apiKey;
    this.shop   = process.env.ETSY_SHOP || options.shop;
    this.lang   = process.env.ETSY_LANG || options.lang || null;
    this._assumeApiKey();
  }

  // https://www.etsy.com/developers/documentation/reference/shop#method_findallshops
  findAllShops(options) {
     return new Promise((resolve, reject) => {
         const getQueryString = queryString.stringify(this.getOptions(options));
         fetch(`${this.apiUrl}/shops?${getQueryString}`)
           .then(response => EtsyClient._response(response, resolve, reject))
           .catch(reject);
     });
  }

  // https://www.etsy.com/developers/documentation/reference/shop#method_getshop
  getShop(options) {
     this._assumeShop();
     return new Promise((resolve, reject) => {
         const getQueryString = queryString.stringify(this.getOptions(options));
         fetch(`${this.apiUrl}/shops/${this.shop}?${getQueryString}`)
           .then(response => EtsyClient._response(response, resolve, reject))
           .catch(reject);
     });
  }

  // https://www.etsy.com/developers/documentation/reference/shopsection#method_findallshopsections
  findAllShopSections(listingId, options) {
     this._assumeShop();
     return new Promise((resolve, reject) => {
         const getQueryString = queryString.stringify(this.getOptions(options));
         fetch(`${this.apiUrl}/shops/${this.shop}/sections?${getQueryString}`)
           .then(response => EtsyClient._response(response, resolve, reject))
           .catch(reject);
     });
  }

  // https://www.etsy.com/developers/documentation/reference/listing#method_findallshoplistingsactive
  findAllShopListingsActive(options) {
     this._assumeShop();
     return new Promise((resolve, reject) => {
         const getQueryString = queryString.stringify(this.getOptions(options));
         fetch(`${this.apiUrl}/shops/${this.shop}/listings/active?${getQueryString}`)
           .then(response => EtsyClient._response(response, resolve, reject))
           .catch(reject);
     });
  }

  // https://www.etsy.com/developers/documentation/reference/listing#method_getlisting
  getListing(listingId, options) {
     this._assumeField('listingId', listingId);
     return new Promise((resolve, reject) => {
         const getQueryString = queryString.stringify(this.getOptions(options));
         fetch(`${this.apiUrl}/listings/${listingId}?${getQueryString}`)
           .then(response => EtsyClient._response(response, resolve, reject))
           .catch(reject);
     });
  }

  // https://www.etsy.com/developers/documentation/reference/listingvariationimage#method_getvariationimages
  getVariationImages(listingId, options) {
     this._assumeField('listingId', listingId);
     return new Promise((resolve, reject) => {
         const getQueryString = queryString.stringify(this.getOptions(options));
         fetch(`${this.apiUrl}/listings/${listingId}/variation-images?${getQueryString}`)
           .then(response => EtsyClient._response(response, resolve, reject))
           .catch(reject);
     });
  }

  // https://www.etsy.com/developers/documentation/reference/listingimage#method_findalllistingimages
  findAllListingImages(listingId, options) {
     this._assumeField('listingId', listingId);
     return new Promise((resolve, reject) => {
         const getQueryString = queryString.stringify(this.getOptions(options));
         fetch(`${this.apiUrl}/listings/${listingId}/images?${getQueryString}`)
           .then(response => EtsyClient._response(response, resolve, reject))
           .catch(reject);
     });
  }

  getOptions(options) {
    var merged = options ? options : {};
    merged['api_key'] = this.apiKey;
    if (this.lang != null) {
      merged['language'] = this.lang;
    }
    return merged;
  }

  _assumeShop() { if (!this.shop) { throw "shop is not defined";  } }
  _assumeApiKey() { if (!this.apiKey) { throw "apiKey is required. You must set ETSY_API_KEY environment variable.";  } }
  _assumeField(fieldName, fieldValue) { if (!fieldValue) { throw fieldName + " is required";  } }

  static _response(response, resolve, reject) {
    EtsyClient._consumeResponseBodyAs(response,
      (json) => {
        if (!response.ok) {
          reject((json && json.details) || (json && json.message) || response.status);
        } else {
          resolve(json);
        }
      },
      (txt) => {
        if (!response.ok) {
          reject(txt);
        } else {
          resolve(txt);// some strange case
        }
      }
    );
  }

  static _consumeResponseBodyAs(response, jsonConsumer, txtConsumer) {
    (async () => {
      var responseString = await response.text();
      try{
        if (responseString && typeof responseString === "string"){
         var responseParsed = JSON.parse(responseString);
         if (EtsyClient.debug) {
            console.log("RESPONSE(Json)", responseParsed);
         }
         return jsonConsumer(responseParsed);
        }
      } catch(error) {
        // text is not a valid json so we will consume as text
      }
      if (EtsyClient.debug) {
        console.log("RESPONSE(Txt)", responseString);
      }
      return txtConsumer(responseString);
    })();
  }
}
module.exports = EtsyClient