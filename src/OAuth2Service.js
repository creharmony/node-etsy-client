// DOC: https://developers.etsy.com/documentation/essentials/authentication

import axios from "axios";
import crypto from 'crypto';
import queryString from 'query-string';

const ETSY_OAUTH_CONNECT = "https://www.etsy.com/oauth/connect"
const ETSY_V3_API_OAUTH_TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token"
const DEFAULT_SCOPES = ['shops_r','listings_r']

const OAUTH_DEBUG = process.env.OAUTH_DEBUG === "1" || false;

/**
 * ETSY OAUTH2 Workflow
 * ********************
 * based on example: https://developers.etsy.com/documentation/tutorials/quickstart
 *
 * 1) authenticate        : generate codeVerifier + state + connectUrl
 *                          set codeVerifier and state in session
 *                          redirect your user to connectUrl.
 *
 * User) grant permission and is redirected by etsy to redirect_uri
 *
 * 2) <incoming callback> : retrieve req.query.code && req.query.state
 *                          [query state and session state must match]
 *
 * 3) askForApiV3Token    : using code + session codeVerifier, request etsy token
 **/
class OAuth2Service {

    /**
     * 1) authenticate
     * example: https://developers.etsy.com/documentation/essentials/authentication/#step-1-request-an-authorization-code
     **/
    authenticate(client_id/*etsy api key*/, redirect_uri, scopes = DEFAULT_SCOPES) {
      const response_type = "code";
      const state = generateState();
      const codeVerifier = generateVerifier();
      const code_challenge_method = "S256";
      const code_challenge = generateS256Challenge(codeVerifier);
      const scope = scopes.join(' ');//space separated - https://developers.etsy.com/documentation/essentials/authentication/#scopes
      const queryStringObject = { response_type, redirect_uri, scope, client_id, state, code_challenge, code_challenge_method};
      OAUTH_DEBUG && console.log(`query: ${JSON.stringify(queryStringObject)}`);

      const connectUrl = ETSY_OAUTH_CONNECT + "?" + queryString.stringify(queryStringObject);
      // const connectUrl = `https://www.etsy.com/oauth/connect?response_type=code&redirect_uri=${callbackUrl}&scope=email_r&client_id=1aa2bb33c44d55eeeeee6fff&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      OAUTH_DEBUG && console.log(`connectUrl: ${connectUrl}`)

      return { codeVerifier, state, connectUrl };
    }

    /* 2) server side - implement incoming callback - after 1) etsy will redirect user to redirect_uri with code and state query params

       example: https://www.exemple.com/api/v0/etsy/callback?code=OYPxG3eexxxwdBLS&state=ztxjkl

         router.get('/callback', async function(req, res, next) {
           const { code, state } = req.query;
           const { codeVerifier, codeState } = req.session.etsyContext;// you have to manage session etsy context data
           try {
             if (!codeVerifier || !codeState ) {
               throw "Missing connect session informations";
             } else if (codeState !== state) {
               throw "Wrong state";
             }
           // ... next step: cf 3)

       in order to develop and test oAuth2 locally, first push this temp redirect

          this way you could use https://www.exemple.com/api/v0/etsy/redirectDev0A2 as callback (dont forget to declare it on etsy)

          router.get('/redirectDev0A2', async function(req, res, next) {
            const originalParams = req.query;
            const endOfURl = originalParams ? '?'+queryString.stringify(originalParams) : '';
            res.redirect("http://localhost:3000/api/v0/etsy/callback" + endOfURl);
          });

     */

    /**
     * ask for an Etsy Open API V3 Token
     *
     * return tokenData {
     *  access_token  : Token to add as etsy api v3 header bearer value - s the OAuth grant token with a user id numeric prefix (12345678 in the example above), which is the internal user_id of the Etsy.com user who grants the application access. The V3 Open API requires the combined user id prefix and OAuth token as formatted in this parameter to authenticate requests.
     *  refresh_token : The Etsy Open API delivers a refresh token with the access token, which you can use to obtain a new access token through the refresh_token grant, and has a longer functional lifetime (90 days).
     *  token_type    : always Bearer which indicates that the OAuth token is a bearer token.
     *  expires_in    : is the valid duration of the OAuth token in seconds from the moment it is granted; 3600 seconds is 1 hour.
     *  expires_ts    : expire timestamp (second since 1970) * generated and added here under
     * }
     **/
    askForApiV3Token(client_id/*etsy api key*/, code, code_verifier, redirect_uri) {
      const grant_type = "authorization_code";
      const postPayload = { grant_type, client_id, redirect_uri, code, code_verifier };

      return new Promise(function(resolve, reject) {
        const askTime = nowSec();
        axios.post(ETSY_V3_API_OAUTH_TOKEN_URL, postPayload)
        .then(response => {
          if (response.status >= 200 && response.status < 300) {
            var json = response.data;
            var tokenData = Object.assign({}, json);
            // tokenData.expires_ts = askTime - 123;// DEV // simulate expired token
            tokenData.expires_ts = askTime + tokenData.expires_in;
            resolve(tokenData);
          } else {
            throw response;
          }
        })
        .catch(result => {
           const status = result.status;
           const json = result.response.data;
           OAUTH_DEBUG && console.log({status, json})
           reject(json);
        });

      });

    }

    // https://developers.etsy.com/documentation/essentials/authentication#requesting-a-refresh-oauth-token
    refreshApiV3Token(client_id/*etsy api key*/, refresh_token) {
      const grant_type = "refresh_token";
      const postPayload = { grant_type, client_id, refresh_token };

      return new Promise(function(resolve, reject) {

        const askTime = nowSec();
        axios.post(ETSY_V3_API_OAUTH_TOKEN_URL, postPayload)
        .then(response => {
          if (response.status >= 200 && response.status < 300) {
            var json = response.data;
            var tokenData = Object.assign({}, json);
            tokenData.expires_ts = askTime + tokenData.expires_in;
            resolve(tokenData);
          } else {
            throw response;
          }
        })
        .catch(result => {
           const status = result.status;
           const json = result.response.data;
           OAUTH_DEBUG && console.log({status, json})
           reject(json);
        });

      });
    }

}
export default OAuth2Service;

//~private
const base64URLEncode = (str) =>
  str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest();

const generateState = () => Math.random().toString(36).substring(7);

const generateVerifier = () => base64URLEncode(crypto.randomBytes(32));

const generateS256Challenge = (verifier) => base64URLEncode(sha256(verifier));

const nowSec = () => Math.floor(Date.now() / 1000); // second since 1 jan 70