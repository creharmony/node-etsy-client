var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EtsyClientV3 } from '../../../lib/export.js'; // node-etsy-client';
function doIt() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new EtsyClientV3();
            const shops = yield client.findShops({ 'shop_name': 'mony', limit: 10 })
                .catch((err) => console.error(err));
            if (shops) {
                console.log(JSON.stringify(shops, null, 2));
            }
        }
        catch (error) {
            console.error("ERROR", error);
        }
    });
}
console.log('TypeScript project');
doIt();
