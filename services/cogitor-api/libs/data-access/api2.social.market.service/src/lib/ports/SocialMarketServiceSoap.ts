import { GetDistributorAvatarList } from "../definitions/GetDistributorAvatarList";
import { GetDistributorAvatarListResponse } from "../definitions/GetDistributorAvatarListResponse";
import { GetGoodsProxyObjectId } from "../definitions/GetGoodsProxyObjectId";
import { GetGoodsProxyObjectIdResponse } from "../definitions/GetGoodsProxyObjectIdResponse";
import { GetProducerAvatarList } from "../definitions/GetProducerAvatarList";
import { GetProducerAvatarListResponse } from "../definitions/GetProducerAvatarListResponse";
import { RefreshWsdl } from "../definitions/RefreshWsdl";
import { RefreshWsdlResponse } from "../definitions/RefreshWsdlResponse";
import { Aaa } from "../definitions/Aaa";
import { AaaResponse } from "../definitions/AaaResponse";

export interface SocialMarketServiceSoap {
    GetDistributorAvatarList(getDistributorAvatarList: GetDistributorAvatarList, callback: (err: any, result: GetDistributorAvatarListResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    GetGoodsProxyObjectId(getGoodsProxyObjectId: GetGoodsProxyObjectId, callback: (err: any, result: GetGoodsProxyObjectIdResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    GetProducerAvatarList(getProducerAvatarList: GetProducerAvatarList, callback: (err: any, result: GetProducerAvatarListResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    RefreshWSDL(refreshWsdl: RefreshWsdl, callback: (err: any, result: RefreshWsdlResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    aaa(aaa: Aaa, callback: (err: any, result: AaaResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}
