declare module 'node-etsy-client' {

  export default class OAuth2Service {
    constructor();
    authenticate(client_id/*etsy api key*/: string, redirect_uri: string, scopes: string[]): object;
    askForApiV3Token(client_id/*etsy api key*/: string, code: string, code_verifier: string, redirect_uri: string): Promise<string | object>;
    refreshApiV3Token(client_id/*etsy api key*/: string, refresh_token: string): Promise<string | object>;
  }
}
