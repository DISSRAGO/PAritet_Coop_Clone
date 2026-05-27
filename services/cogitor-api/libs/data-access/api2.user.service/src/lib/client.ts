import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { AddIpToAccessIpList } from './definitions/AddIpToAccessIpList';
import { AddIpToAccessIpListResponse } from './definitions/AddIpToAccessIpListResponse';
import { Auth } from './definitions/Auth';
import { AuthResponse } from './definitions/AuthResponse';
import { ChangePassword } from './definitions/ChangePassword';
import { ChangePasswordResponse } from './definitions/ChangePasswordResponse';
import { DelIpToAccessIpList } from './definitions/DelIpToAccessIpList';
import { DelIpToAccessIpListResponse } from './definitions/DelIpToAccessIpListResponse';
import { EditUserProfile } from './definitions/EditUserProfile';
import { EditUserProfileResponse } from './definitions/EditUserProfileResponse';
import { EscapePo } from './definitions/EscapePo';
import { EscapePoResponse } from './definitions/EscapePoResponse';
import { GetAbonent } from './definitions/GetAbonent';
import { GetAbonentResponse } from './definitions/GetAbonentResponse';
import { GetAccount } from './definitions/GetAccount';
import { GetAccountResponse } from './definitions/GetAccountResponse';
import { GetContainerAccessIp } from './definitions/GetContainerAccessIp';
import { GetContainerAccessIpResponse } from './definitions/GetContainerAccessIpResponse';
import { GetContainerPswd } from './definitions/GetContainerPswd';
import { GetContainerPswdResponse } from './definitions/GetContainerPswdResponse';
import { GetHelp } from './definitions/GetHelp';
import { GetHelpResponse } from './definitions/GetHelpResponse';
import { GetSmsNotification } from './definitions/GetSmsNotification';
import { GetSmsNotificationResponse } from './definitions/GetSmsNotificationResponse';
import { LoadEnterPo } from './definitions/LoadEnterPo';
import { LoadEnterPoResponse } from './definitions/LoadEnterPoResponse';
import { RefreshWsdl } from './definitions/RefreshWsdl';
import { RefreshWsdlResponse } from './definitions/RefreshWsdlResponse';
import { SaveUserProfile } from './definitions/SaveUserProfile';
import { SaveUserProfileResponse } from './definitions/SaveUserProfileResponse';
import { SetPhoneByPassport } from './definitions/SetPhoneByPassport';
import { SetPhoneByPassportResponse } from './definitions/SetPhoneByPassportResponse';
import { SwitchSmsNotification } from './definitions/SwitchSmsNotification';
import { SwitchSmsNotificationResponse } from './definitions/SwitchSmsNotificationResponse';
import { ValidateIp } from './definitions/ValidateIp';
import { ValidateIpResponse } from './definitions/ValidateIpResponse';
import { User } from './services/User';

export interface Api2UserServiceClient extends SoapClient {
  User: User;
  AddIPToAccessIpListAsync(
    addIpToAccessIpList: AddIpToAccessIpList,
  ): Promise<
    [
      result: AddIpToAccessIpListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  AuthAsync(
    auth: Auth,
  ): Promise<
    [result: AuthResponse, rawResponse: any, soapHeader: any, rawRequest: any]
  >;
  ChangePasswordAsync(
    changePassword: ChangePassword,
  ): Promise<
    [
      result: ChangePasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  DelIPToAccessIpListAsync(
    delIpToAccessIpList: DelIpToAccessIpList,
  ): Promise<
    [
      result: DelIpToAccessIpListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  EditUserProfileAsync(
    editUserProfile: EditUserProfile,
  ): Promise<
    [
      result: EditUserProfileResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  EscapePOAsync(
    escapePo: EscapePo,
  ): Promise<
    [
      result: EscapePoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetAbonentAsync(
    getAbonent: GetAbonent,
  ): Promise<
    [
      result: GetAbonentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetAccountAsync(
    getAccount: GetAccount,
  ): Promise<
    [
      result: GetAccountResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetContainerAccessIPAsync(
    getContainerAccessIp: GetContainerAccessIp,
  ): Promise<
    [
      result: GetContainerAccessIpResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetContainerPswdAsync(
    getContainerPswd: GetContainerPswd,
  ): Promise<
    [
      result: GetContainerPswdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHelpAsync(
    getHelp: GetHelp,
  ): Promise<
    [
      result: GetHelpResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetSmsNotificationAsync(
    getSmsNotification: GetSmsNotification,
  ): Promise<
    [
      result: GetSmsNotificationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  LoadEnterPOAsync(
    loadEnterPo: LoadEnterPo,
  ): Promise<
    [
      result: LoadEnterPoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RefreshWSDLAsync(
    refreshWsdl: RefreshWsdl,
  ): Promise<
    [
      result: RefreshWsdlResponse,
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
  SetPhoneByPassportAsync(
    setPhoneByPassport: SetPhoneByPassport,
  ): Promise<
    [
      result: SetPhoneByPassportResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SwitchSmsNotificationAsync(
    switchSmsNotification: SwitchSmsNotification,
  ): Promise<
    [
      result: SwitchSmsNotificationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ValidateIPAsync(
    validateIp: ValidateIp,
  ): Promise<
    [
      result: ValidateIpResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
}

/** Create Api2UserServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<Api2UserServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
