import OAuth2Service from '../OAuth2Service.js';

const etsyApiKey  = process.env.ETSY_API_KEY;
const redirect_uri = process.env.ETSY_REDIRECT_URI || "https://example.com/api/etsy/callback";// set your own domain !
const oauthService = new OAuth2Service();

//~ manual - HowTo get oAuth2 access_token
//-----------------------------------------
// Requirements:
// - go to etsy backend to declare your domain callback url(s)
//   you need a valid callback uri (even if your prod backend is not able to handle it)
// - setup your environment :
//        ETSY_API_KEY with your api key
//        ESY_REDIRECT_URI with your callback url
//        OAUTH_DEBUG=1
// execute 1..3 steps under

//1- node src/sample/oauth.js code
function askCode() {
    oauthService.authenticate(etsyApiKey, redirect_uri);
}

//2a- update code_verifier value used in askToken below with askCode()::code_verifier
//2b- copy-paste askCode()::connectUrl link into browser to retrieve code (after grant success && redirect)
//2c- update code below using one from redirect_uri result (from browser address bar)

//3- node src/sample/auth.js token
async function askToken() {
  const code_verifier = 'v1QW_Wi0zxxxxxxxg';
  const code = 'wFq0dD6MG1OTfbG-xxxxx';
  const token = await oauthService.askForApiV3Token(etsyApiKey, code, code_verifier, redirect_uri)
                                  .catch(err => { console.error(err); });
  console.log(token)
}

const myArgs = process.argv.slice(2);
switch (myArgs[0]) {
  case 'token':
     askToken();
  default:
    askCode();
}
