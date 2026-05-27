import { BeforeRegisterCredentials } from '../definitions/BeforeRegisterCredentials';
import { BeforeRegisterCredentialsResponse } from '../definitions/BeforeRegisterCredentialsResponse';
import { BeforeRegisterExt } from '../definitions/BeforeRegisterExt';
import { BeforeRegisterExtResponse } from '../definitions/BeforeRegisterExtResponse';
import { GetAbonentIdByToken } from '../definitions/GetAbonentIdByToken';
import { GetAbonentIdByTokenResponse } from '../definitions/GetAbonentIdByTokenResponse';
import { GetTokenList } from '../definitions/GetTokenList';
import { GetTokenListResponse } from '../definitions/GetTokenListResponse';
import { RefreshWsdl } from '../definitions/RefreshWsdl';
import { RefreshWsdlResponse } from '../definitions/RefreshWsdlResponse';
import { RegisterAbonent } from '../definitions/RegisterAbonent';
import { RegisterAbonentResponse } from '../definitions/RegisterAbonentResponse';
import { RegisterLevel2 } from '../definitions/RegisterLevel2';
import { RegisterLevel2Response } from '../definitions/RegisterLevel2Response';
import { RegisterLevel3 } from '../definitions/RegisterLevel3';
import { RegisterLevel3Response } from '../definitions/RegisterLevel3Response';
import { RegisterMailBox } from '../definitions/RegisterMailBox';
import { RegisterMailBoxResponse } from '../definitions/RegisterMailBoxResponse';
import { RegisterMediaClub } from '../definitions/RegisterMediaClub';
import { RegisterMediaClubResponse } from '../definitions/RegisterMediaClubResponse';
import { RegisterPo } from '../definitions/RegisterPo';
import { RegisterPoResponse } from '../definitions/RegisterPoResponse';
import { RegistredCommonCredentials } from '../definitions/RegistredCommonCredentials';
import { RegistredCommonCredentialsResponse } from '../definitions/RegistredCommonCredentialsResponse';
import { RegistredCredentialsAuthorized } from '../definitions/RegistredCredentialsAuthorized';
import { RegistredCredentialsAuthorizedResponse } from '../definitions/RegistredCredentialsAuthorizedResponse';
import { SendActivationRequest } from '../definitions/SendActivationRequest';
import { SendActivationRequestResponse } from '../definitions/SendActivationRequestResponse';
import { ValidateCredentials } from '../definitions/ValidateCredentials';
import { ValidateCredentialsResponse } from '../definitions/ValidateCredentialsResponse';
import { ValidateEmail } from '../definitions/ValidateEmail';
import { ValidateEmailResponse } from '../definitions/ValidateEmailResponse';
import { ValidateLogin } from '../definitions/ValidateLogin';
import { ValidateLoginResponse } from '../definitions/ValidateLoginResponse';
import { ValidatePassword } from '../definitions/ValidatePassword';
import { ValidatePasswordResponse } from '../definitions/ValidatePasswordResponse';
import { ValidatePhone } from '../definitions/ValidatePhone';
import { ValidatePhoneResponse } from '../definitions/ValidatePhoneResponse';
import { ValidateRestorePassword } from '../definitions/ValidateRestorePassword';
import { ValidateRestorePasswordResponse } from '../definitions/ValidateRestorePasswordResponse';

export interface RegistrationSoap {
  BeforeRegisterCredentials(
    beforeRegisterCredentials: BeforeRegisterCredentials,
    callback: (
      err: any,
      result: BeforeRegisterCredentialsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  BeforeRegisterExt(
    beforeRegisterExt: BeforeRegisterExt,
    callback: (
      err: any,
      result: BeforeRegisterExtResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetAbonentIdByToken(
    getAbonentIdByToken: GetAbonentIdByToken,
    callback: (
      err: any,
      result: GetAbonentIdByTokenResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetTokenList(
    getTokenList: GetTokenList,
    callback: (
      err: any,
      result: GetTokenListResponse,
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
  RegisterAbonent(
    registerAbonent: RegisterAbonent,
    callback: (
      err: any,
      result: RegisterAbonentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RegisterLevel2(
    registerLevel2: RegisterLevel2,
    callback: (
      err: any,
      result: RegisterLevel2Response,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RegisterLevel3(
    registerLevel3: RegisterLevel3,
    callback: (
      err: any,
      result: RegisterLevel3Response,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RegisterMailBox(
    registerMailBox: RegisterMailBox,
    callback: (
      err: any,
      result: RegisterMailBoxResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RegisterMediaClub(
    registerMediaClub: RegisterMediaClub,
    callback: (
      err: any,
      result: RegisterMediaClubResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RegisterPO(
    registerPo: RegisterPo,
    callback: (
      err: any,
      result: RegisterPoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RegistredCommonCredentials(
    registredCommonCredentials: RegistredCommonCredentials,
    callback: (
      err: any,
      result: RegistredCommonCredentialsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RegistredCredentialsAuthorized(
    registredCredentialsAuthorized: RegistredCredentialsAuthorized,
    callback: (
      err: any,
      result: RegistredCredentialsAuthorizedResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SendActivationRequest(
    sendActivationRequest: SendActivationRequest,
    callback: (
      err: any,
      result: SendActivationRequestResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ValidateCredentials(
    validateCredentials: ValidateCredentials,
    callback: (
      err: any,
      result: ValidateCredentialsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ValidateEmail(
    validateEmail: ValidateEmail,
    callback: (
      err: any,
      result: ValidateEmailResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ValidateLogin(
    validateLogin: ValidateLogin,
    callback: (
      err: any,
      result: ValidateLoginResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ValidatePassword(
    validatePassword: ValidatePassword,
    callback: (
      err: any,
      result: ValidatePasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ValidatePhone(
    validatePhone: ValidatePhone,
    callback: (
      err: any,
      result: ValidatePhoneResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ValidateRestorePassword(
    validateRestorePassword: ValidateRestorePassword,
    callback: (
      err: any,
      result: ValidateRestorePasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
}
