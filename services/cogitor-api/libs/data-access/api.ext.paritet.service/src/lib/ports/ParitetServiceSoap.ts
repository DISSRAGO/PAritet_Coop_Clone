import { ChangeUserProfileEmailPhone } from '../definitions/ChangeUserProfileEmailPhone';
import { ChangeUserProfileEmailPhoneResponse } from '../definitions/ChangeUserProfileEmailPhoneResponse';
import { GetOperationHistoryByAccount } from '../definitions/GetOperationHistoryByAccount';
import { GetOperationHistoryByAccountResponse } from '../definitions/GetOperationHistoryByAccountResponse';
import { GetOrganizationInfo } from '../definitions/GetOrganizationInfo';
import { GetOrganizationInfoResponse } from '../definitions/GetOrganizationInfoResponse';
import { GetReferalShareHolderList } from '../definitions/GetReferalShareHolderList';
import { GetReferalShareHolderListResponse } from '../definitions/GetReferalShareHolderListResponse';
import { GetShareHolder } from '../definitions/GetShareHolder';
import { GetShareHolderResponse } from '../definitions/GetShareHolderResponse';
import { GetShareHolderList } from '../definitions/GetShareHolderList';
import { GetShareHolderListResponse } from '../definitions/GetShareHolderListResponse';
import { GetUserProfile } from '../definitions/GetUserProfile';
import { GetUserProfileResponse } from '../definitions/GetUserProfileResponse';
import { GetUserStatusInParitet } from '../definitions/GetUserStatusInParitet';
import { GetUserStatusInParitetResponse } from '../definitions/GetUserStatusInParitetResponse';
import { Register } from '../definitions/Register';
import { RegisterResponse } from '../definitions/RegisterResponse';
import { SaveUserProfile } from '../definitions/SaveUserProfile';
import { SaveUserProfileResponse } from '../definitions/SaveUserProfileResponse';
import { SendJoinRequest } from '../definitions/SendJoinRequest';
import { SendJoinRequestResponse } from '../definitions/SendJoinRequestResponse';
import { Verify } from '../definitions/Verify';
import { VerifyResponse } from '../definitions/VerifyResponse';

export interface ParitetServiceSoap {
  ChangeUserProfileEmailPhone(
    changeUserProfileEmailPhone: ChangeUserProfileEmailPhone,
    callback: (
      err: any,
      result: ChangeUserProfileEmailPhoneResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetOperationHistoryByAccount(
    getOperationHistoryByAccount: GetOperationHistoryByAccount,
    callback: (
      err: any,
      result: GetOperationHistoryByAccountResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetOrganizationInfo(
    getOrganizationInfo: GetOrganizationInfo,
    callback: (
      err: any,
      result: GetOrganizationInfoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetReferalShareHolderList(
    getReferalShareHolderList: GetReferalShareHolderList,
    callback: (
      err: any,
      result: GetReferalShareHolderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetShareHolder(
    getShareHolder: GetShareHolder,
    callback: (
      err: any,
      result: GetShareHolderResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetShareHolderList(
    getShareHolderList: GetShareHolderList,
    callback: (
      err: any,
      result: GetShareHolderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetUserProfile(
    getUserProfile: GetUserProfile,
    callback: (
      err: any,
      result: GetUserProfileResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetUserStatusInParitet(
    getUserStatusInParitet: GetUserStatusInParitet,
    callback: (
      err: any,
      result: GetUserStatusInParitetResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  Register(
    register: Register,
    callback: (
      err: any,
      result: RegisterResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SaveUserProfile(
    saveUserProfile: SaveUserProfile,
    callback: (
      err: any,
      result: SaveUserProfileResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SendJoinRequest(
    sendJoinRequest: SendJoinRequest,
    callback: (
      err: any,
      result: SendJoinRequestResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  Verify(
    verify: Verify,
    callback: (
      err: any,
      result: VerifyResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
}
