import { AddIpToAccessIpList } from '../definitions/AddIpToAccessIpList';
import { AddIpToAccessIpListResponse } from '../definitions/AddIpToAccessIpListResponse';
import { Auth } from '../definitions/Auth';
import { AuthResponse } from '../definitions/AuthResponse';
import { ChangePassword } from '../definitions/ChangePassword';
import { ChangePasswordResponse } from '../definitions/ChangePasswordResponse';
import { DelIpToAccessIpList } from '../definitions/DelIpToAccessIpList';
import { DelIpToAccessIpListResponse } from '../definitions/DelIpToAccessIpListResponse';
import { EditUserProfile } from '../definitions/EditUserProfile';
import { EditUserProfileResponse } from '../definitions/EditUserProfileResponse';
import { EscapePo } from '../definitions/EscapePo';
import { EscapePoResponse } from '../definitions/EscapePoResponse';
import { GetAbonent } from '../definitions/GetAbonent';
import { GetAbonentResponse } from '../definitions/GetAbonentResponse';
import { GetAccount } from '../definitions/GetAccount';
import { GetAccountResponse } from '../definitions/GetAccountResponse';
import { GetContainerAccessIp } from '../definitions/GetContainerAccessIp';
import { GetContainerAccessIpResponse } from '../definitions/GetContainerAccessIpResponse';
import { GetContainerPswd } from '../definitions/GetContainerPswd';
import { GetContainerPswdResponse } from '../definitions/GetContainerPswdResponse';
import { GetHelp } from '../definitions/GetHelp';
import { GetHelpResponse } from '../definitions/GetHelpResponse';
import { GetSmsNotification } from '../definitions/GetSmsNotification';
import { GetSmsNotificationResponse } from '../definitions/GetSmsNotificationResponse';
import { LoadEnterPo } from '../definitions/LoadEnterPo';
import { LoadEnterPoResponse } from '../definitions/LoadEnterPoResponse';
import { RefreshWsdl } from '../definitions/RefreshWsdl';
import { RefreshWsdlResponse } from '../definitions/RefreshWsdlResponse';
import { SaveUserProfile } from '../definitions/SaveUserProfile';
import { SaveUserProfileResponse } from '../definitions/SaveUserProfileResponse';
import { SetPhoneByPassport } from '../definitions/SetPhoneByPassport';
import { SetPhoneByPassportResponse } from '../definitions/SetPhoneByPassportResponse';
import { SwitchSmsNotification } from '../definitions/SwitchSmsNotification';
import { SwitchSmsNotificationResponse } from '../definitions/SwitchSmsNotificationResponse';
import { ValidateIp } from '../definitions/ValidateIp';
import { ValidateIpResponse } from '../definitions/ValidateIpResponse';

export interface UserSoap {
  AddIPToAccessIpList(
    addIpToAccessIpList: AddIpToAccessIpList,
    callback: (
      err: any,
      result: AddIpToAccessIpListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  Auth(
    auth: Auth,
    callback: (
      err: any,
      result: AuthResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ChangePassword(
    changePassword: ChangePassword,
    callback: (
      err: any,
      result: ChangePasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  DelIPToAccessIpList(
    delIpToAccessIpList: DelIpToAccessIpList,
    callback: (
      err: any,
      result: DelIpToAccessIpListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  EditUserProfile(
    editUserProfile: EditUserProfile,
    callback: (
      err: any,
      result: EditUserProfileResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  EscapePO(
    escapePo: EscapePo,
    callback: (
      err: any,
      result: EscapePoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetAbonent(
    getAbonent: GetAbonent,
    callback: (
      err: any,
      result: GetAbonentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetAccount(
    getAccount: GetAccount,
    callback: (
      err: any,
      result: GetAccountResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetContainerAccessIP(
    getContainerAccessIp: GetContainerAccessIp,
    callback: (
      err: any,
      result: GetContainerAccessIpResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetContainerPswd(
    getContainerPswd: GetContainerPswd,
    callback: (
      err: any,
      result: GetContainerPswdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetHelp(
    getHelp: GetHelp,
    callback: (
      err: any,
      result: GetHelpResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetSmsNotification(
    getSmsNotification: GetSmsNotification,
    callback: (
      err: any,
      result: GetSmsNotificationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  LoadEnterPO(
    loadEnterPo: LoadEnterPo,
    callback: (
      err: any,
      result: LoadEnterPoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RefreshWSDL(
    refreshWsdl: RefreshWsdl,
    callback: (
      err: any,
      result: RefreshWsdlResponse,
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
  SetPhoneByPassport(
    setPhoneByPassport: SetPhoneByPassport,
    callback: (
      err: any,
      result: SetPhoneByPassportResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SwitchSmsNotification(
    switchSmsNotification: SwitchSmsNotification,
    callback: (
      err: any,
      result: SwitchSmsNotificationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ValidateIP(
    validateIp: ValidateIp,
    callback: (
      err: any,
      result: ValidateIpResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
}
