import { Client as SoapClient, createClientAsync as soapCreateClientAsync } from "soap";
import { GetDistributorAvatarList } from "./definitions/GetDistributorAvatarList";
import { GetDistributorAvatarListResponse } from "./definitions/GetDistributorAvatarListResponse";
import { GetGoodsProxyObjectId } from "./definitions/GetGoodsProxyObjectId";
import { GetGoodsProxyObjectIdResponse } from "./definitions/GetGoodsProxyObjectIdResponse";
import { GetProducerAvatarList } from "./definitions/GetProducerAvatarList";
import { GetProducerAvatarListResponse } from "./definitions/GetProducerAvatarListResponse";
import { RefreshWsdl } from "./definitions/RefreshWsdl";
import { RefreshWsdlResponse } from "./definitions/RefreshWsdlResponse";
import { Aaa } from "./definitions/Aaa";
import { AaaResponse } from "./definitions/AaaResponse";
import { SocialMarketService } from "./services/SocialMarketService";

export interface Api2SocialMarketServiceClient extends SoapClient {
    SocialMarketService: SocialMarketService;
    GetDistributorAvatarListAsync(getDistributorAvatarList: GetDistributorAvatarList): Promise<[result: GetDistributorAvatarListResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetGoodsProxyObjectIdAsync(getGoodsProxyObjectId: GetGoodsProxyObjectId): Promise<[result: GetGoodsProxyObjectIdResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetProducerAvatarListAsync(getProducerAvatarList: GetProducerAvatarList): Promise<[result: GetProducerAvatarListResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    RefreshWSDLAsync(refreshWsdl: RefreshWsdl): Promise<[result: RefreshWsdlResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    aaaAsync(aaa: Aaa): Promise<[result: AaaResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create Api2SocialMarketServiceClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<Api2SocialMarketServiceClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
