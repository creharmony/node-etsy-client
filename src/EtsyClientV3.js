import queryString from 'query-string';
import axios from "axios";
import SusiRali from 'susi-rali';

const DEFAULT_DRY_MODE = false;// DEBUG // if true, then print get onto console instead of calling etsy

/**
 * this utility class implement ETSY (some) methods documented here:
 * https://developers.etsy.com/documentation/ > API V3 Reference
 **/
class EtsyClientV3 {

  static debug = process.env.ETSY_DEBUG && process.env.ETSY_DEBUG === "true";

  constructor(options) {
    if (!options) {
      options = {};
    }
    this.nbCall = 0;
    this.apiUrl = "apiUrl" in options ? options.apiUrl : (process.env.ETSY_API_ENDPOINT || 'https://openapi.etsy.com/v3/application');
    this.apiTimeoutMs = Number("apiTimeoutMs" in options ? options.apiTimeoutMs : (process.env.ETSY_API_TIMEOUT_MS || '20000'));
    this.apiTimeoutMs = (this.apiTimeoutMs > 1000 && this.apiTimeoutMs < 300000) ? this.apiTimeoutMs : 20000;
    this._assumeApiUrl();
    this.apiKey = "apiKey" in options ? options.apiKey : process.env.ETSY_API_KEY;
    this._assumeApiKey();
    this.shopId = "shopId" in options ? options.shopId : process.env.ETSY_SHOP_ID;
    this.accessToken = "accessToken" in options ? options.accessToken : null;
    this.lang   = "lang" in options ? options.lang : process.env.ETSY_LANG;
    // configure rate limit on etsy call : max <etsyRateMaxQueries> per <etsyRateWindowSizeMs> ms
    // Etsy rate limit doc (10/sec) : https://www.etsy.com/developers/documentation/getting_started/api_basics#section_rate_limiting
    this.etsyRateWindowSizeMs = "etsyRateWindowSizeMs" in options ? options.etsyRateWindowSizeMs : (process.env.ETSY_RATE_WINDOWS_SIZE_MS  || 1000);
    this.etsyRateMaxQueries   = "etsyRateMaxQueries" in options ? options.etsyRateMaxQueries : (process.env.ETSY_RATE_MAX_QUERIES || null);
    this.dryMode              = "dryMode" in options ? options.dryMode : ("true" === process.env.ETSY_DRY_MODE || DEFAULT_DRY_MODE);

    this.initRateLimiter();
    this._axios = axios.create({
      baseURL: this.apiUrl,
      timeout: this.apiTimeoutMs
    });
    // DEBUG // console.debug(`EtsyClientV3 - apiUrl:${this.apiUrl} - dryMode:${this.dryMode} - ${this.limiterDesc}`);
  }

  initRateLimiter() {
    this.limiter = (this.etsyRateWindowSizeMs === null || this.etsyRateMaxQueries === null) ? null :
      new SusiRali({
          windowsMs:this.etsyRateWindowSizeMs,
          maxQueryPerWindow:this.etsyRateMaxQueries,
          debugEnabled: false
      });
    this.limiterDesc = (!this.isRateLimitEnabled()) ? "" : `Rate limit of ${this.etsyRateMaxQueries} queries per ${this.etsyRateWindowSizeMs}ms`;
  }

  isRateLimitEnabled() {
    return this.limiter !== null;
  }

  // https://developers.etsy.com/documentation/reference/#operation/findShops
  findShops(options) {
    this._assumeField('shop_name', options.shop_name);
    return this.limitedEtsyApiFetch(`/shops`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getShop
  getShop(options) {
     this._assumeShopId();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getShopSections
  getShopSections(options) {
     this._assumeShopId();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/sections`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/findAllActiveListingsByShop
  findAllActiveListingsByShop(options) {
     this._assumeShopId();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings/active`, options);
  }
  // https://github.com/etsy/open-api/issues/377
  findAllActiveListingsByShopHack(options) {
     this._assumeShopId();
     options.state="active";
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListing
  getListing(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingVariationImages
  getListingVariationImages(listingId, options) {
     this._assumeField('listingId', listingId);
     this._assumeShopId();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings/${listingId}/variation-images`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingImages
  getListingImages(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}/images`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingProperty
  getListingProperty(listingId, options) {
     this._assumeField('listingId', listingId);
     this._assumeShopId();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings/${listingId}/properties`, options);
  }

  //~ oauth2 required under

  // https://developers.etsy.com/documentation/reference/#operation/getListingsByShop
  getListingsByShop(options) {
     this._assumeShopId();
     this._assumeOAuth2();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingInventory
  getListingInventory(listingId, options) {
     this._assumeField('listingId', listingId);
     this._assumeOAuth2();
     return this.limitedEtsyApiFetch(`/listings/${listingId}/inventory`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingProduct
  getListingProduct(listingId, productId, options) {
     this._assumeField('listingId', listingId);
     this._assumeField('productId', productId);
     this._assumeOAuth2();
     return this.limitedEtsyApiFetch(`/listings/${listingId}/inventory/products/${productId}`, options);
  }

  /*
   *
   *
   * the api you're looking for is missing ?
   *  => add an issue ou create a pull-request !
   *  => https://github.com/creharmony/node-etsy-client
   *
   *
   */

  //~ rate limit and api utility tools under

  limitedEtsyApiFetch(endpoint, options) {
    var client = this;
    if (!client.isRateLimitEnabled()) {
      return client.safeEtsyApiFetch(endpoint, options);
    } else {
      return new Promise(async function(resolve, reject) {
        await client.limiter.limitedCall(() => client.safeEtsyApiFetch(endpoint, options))
                  .then(resolve).catch(reject);
      });
    }
  }

  safeEtsyApiFetch(endpoint, options) {
     this._assumeField('endpoint', endpoint);
     var client = this;
     return new Promise((resolve, reject) => {
         const enrichedOptions = client.getOptions(options);
         var headers = {};
         if (enrichedOptions.apiKey) {
           headers["x-api-key"] = enrichedOptions.apiKey;
         }
         if (enrichedOptions.accessToken) {
           headers['Authorization'] = `Bearer ${enrichedOptions.accessToken}`; // Scoped endpoints require a bearer token
         }
         const queryOptions = Object.assign({}, enrichedOptions);
         delete queryOptions.apiKey;
         delete queryOptions.accessToken
         const getQueryString = queryString.stringify(queryOptions);
         const requestEndpoint = `${client.apiUrl}${endpoint}?${getQueryString}`;
         EtsyClientV3.debug && console.log(`request ${requestEndpoint} headers: **hidden**`);
         client.nodeAxios(requestEndpoint, headers)
           .then(response => EtsyClientV3._response(response, resolve, reject))
           .catch(requestError => {
             EtsyClientV3.debug && console.log(`request err ${JSON.stringify(requestError)}`);
             var secureError = {};
             client.secureErrorAttribute(secureError, requestError, "message");
             client.secureErrorAttribute(secureError, requestError, "code");
             reject(secureError);
           });
     });
  }

  secureErrorAttribute(secureError, sourceError, attribute) {
    if (!Object.keys(sourceError).includes(attribute)) {
      return;
    }
    secureError[attribute] = this.secureAttributeValue(sourceError[attribute]);
  }

  secureAttributeValue(value) {
    return (value === null || value === undefined) ? null : value.replace(new RegExp(this.apiKey,'g'), "**hidden**");
  }

  getOptions(options) {
    var merged = options ? options : {};
    if (this.apiKey != null && !("apiKey" in merged)) {
      merged['apiKey'] = this.apiKey;
    }
    if (this.accessToken != null && !("accessToken" in merged)) {
      merged['accessToken'] = this.accessToken;
    }
    // default lang is client one
    if (this.lang != null && !("language" in merged)) {
      merged['language'] = this.lang;
    }
    // lang option override client one
    if ("lang" in merged) {
      merged['language'] = merged['lang'];
      delete merged.lang;
    }
    return merged;
  }

  dryFetch(endpoint) {
    const response = {};
    response.status = 200;
    response.data = {endpoint};
    console.log(`[dry_get] ${endpoint}`);
    return Promise.resolve(response);
  }

  nodeAxios(endpoint, headers=[]) {
    const client = this;
    if (EtsyClientV3.debug) {
      console.log(">>>", endpoint);
    }
    this.nbCall++;
    if (this.dryMode) {
      return this.dryFetch(endpoint);
    }
    return client._axios.get(endpoint, { headers });
  }

  getNbCall() {
    return this.nbCall;
  }

  razStats() {
    this.nbCall = 0;
  }

  hasOAuth2() {
    return isSet(this.accessToken);
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  _assumeShopId() { if (!isSet(this.shopId)) { throw "shopId is not defined";  } }
  _assumeOAuth2() { if (!isSet(this.accessToken)) { throw "accessToken is not defined";  } }
  _assumeApiUrl() { if (!isSet(this.apiUrl)) { throw "apiUrl is required. ie. set ETSY_API_ENDPOINT environment variable.";  } }
  _assumeApiKey() { if (!isSet(this.apiKey)) { throw "apiKey is required. ie. set ETSY_API_KEY environment variable.";  } }
  _assumeField(fieldName, fieldValue) { if (!fieldValue) { throw fieldName + " is required";  } }

  static _response(response, resolve, reject) {
    if (response.status >= 200 && response.status < 300) {
      resolve(response.data);
    } else {
      reject(response.data);
    }
  }

}
export default EtsyClientV3;

const isSet = (val) => val !== undefined && val !== null && val !== "";