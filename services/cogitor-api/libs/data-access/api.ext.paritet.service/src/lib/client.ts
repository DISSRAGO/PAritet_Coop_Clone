import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { ChangeUserProfileEmailPhone } from './definitions/ChangeUserProfileEmailPhone';
import { ChangeUserProfileEmailPhoneResponse } from './definitions/ChangeUserProfileEmailPhoneResponse';
import { GetOperationHistoryByAccount } from './definitions/GetOperationHistoryByAccount';
import { GetOperationHistoryByAccountResponse } from './definitions/GetOperationHistoryByAccountResponse';
import { GetOrganizationInfo } from './definitions/GetOrganizationInfo';
import { GetOrganizationInfoResponse } from './definitions/GetOrganizationInfoResponse';
import { GetReferalShareHolderList } from './definitions/GetReferalShareHolderList';
import { GetReferalShareHolderListResponse } from './definitions/GetReferalShareHolderListResponse';
import { GetShareHolder } from './definitions/GetShareHolder';
import { GetShareHolderResponse } from './definitions/GetShareHolderResponse';
import { GetShareHolderList } from './definitions/GetShareHolderList';
import { GetShareHolderListResponse } from './definitions/GetShareHolderListResponse';
import { GetUserProfile } from './definitions/GetUserProfile';
import { GetUserProfileResponse } from './definitions/GetUserProfileResponse';
import { GetUserStatusInParitet } from './definitions/GetUserStatusInParitet';
import { GetUserStatusInParitetResponse } from './definitions/GetUserStatusInParitetResponse';
import { Register } from './definitions/Register';
import { RegisterResponse } from './definitions/RegisterResponse';
import { SaveUserProfile } from './definitions/SaveUserProfile';
import { SaveUserProfileResponse } from './definitions/SaveUserProfileResponse';
import { SendJoinRequest } from './definitions/SendJoinRequest';
import { SendJoinRequestResponse } from './definitions/SendJoinRequestResponse';
import { Verify } from './definitions/Verify';
import { VerifyResponse } from './definitions/VerifyResponse';
import { ParitetService } from './services/ParitetService';

export interface ApiExtParitetServiceClient extends SoapClient {
  ParitetService: ParitetService;
  ChangeUserProfileEmailPhoneAsync(
    changeUserProfileEmailPhone: ChangeUserProfileEmailPhone,
  ): Promise<
    [
      result: ChangeUserProfileEmailPhoneResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetOperationHistoryByAccountAsync(
    getOperationHistoryByAccount: GetOperationHistoryByAccount,
  ): Promise<
    [
      result: GetOperationHistoryByAccountResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetOrganizationInfoAsync(
    getOrganizationInfo: GetOrganizationInfo,
  ): Promise<
    [
      result: GetOrganizationInfoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetReferalShareHolderListAsync(
    getReferalShareHolderList: GetReferalShareHolderList,
  ): Promise<
    [
      result: GetReferalShareHolderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetShareHolderAsync(
    getShareHolder: GetShareHolder,
  ): Promise<
    [
      result: GetShareHolderResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetShareHolderListAsync(
    getShareHolderList: GetShareHolderList,
  ): Promise<
    [
      result: GetShareHolderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetUserProfileAsync(
    getUserProfile: GetUserProfile,
  ): Promise<
    [
      result: GetUserProfileResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetUserStatusInParitetAsync(
    getUserStatusInParitet: GetUserStatusInParitet,
  ): Promise<
    [
      result: GetUserStatusInParitetResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RegisterAsync(
    register: Register,
  ): Promise<
    [
      result: RegisterResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SaveUserProfileAsync(
    saveUserProfile: SaveUserProfile,
  ): Promise<
    [
      result: SaveUserProfileResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SendJoinRequestAsync(
    sendJoinRequest: SendJoinRequest,
  ): Promise<
    [
      result: SendJoinRequestResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  VerifyAsync(
    verify: Verify,
  ): Promise<
    [result: VerifyResponse, rawResponse: any, soapHeader: any, rawRequest: any]
  >;
}

/** Create ApiExtParitetServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<ApiExtParitetServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
