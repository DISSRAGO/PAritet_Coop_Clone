import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { BeforeRegisterCredentials } from './definitions/BeforeRegisterCredentials';
import { BeforeRegisterCredentialsResponse } from './definitions/BeforeRegisterCredentialsResponse';
import { BeforeRegisterExt } from './definitions/BeforeRegisterExt';
import { BeforeRegisterExtResponse } from './definitions/BeforeRegisterExtResponse';
import { GetAbonentIdByToken } from './definitions/GetAbonentIdByToken';
import { GetAbonentIdByTokenResponse } from './definitions/GetAbonentIdByTokenResponse';
import { GetTokenList } from './definitions/GetTokenList';
import { GetTokenListResponse } from './definitions/GetTokenListResponse';
import { RefreshWsdl } from './definitions/RefreshWsdl';
import { RefreshWsdlResponse } from './definitions/RefreshWsdlResponse';
import { RegisterAbonent } from './definitions/RegisterAbonent';
import { RegisterAbonentResponse } from './definitions/RegisterAbonentResponse';
import { RegisterLevel2 } from './definitions/RegisterLevel2';
import { RegisterLevel2Response } from './definitions/RegisterLevel2Response';
import { RegisterLevel3 } from './definitions/RegisterLevel3';
import { RegisterLevel3Response } from './definitions/RegisterLevel3Response';
import { RegisterMailBox } from './definitions/RegisterMailBox';
import { RegisterMailBoxResponse } from './definitions/RegisterMailBoxResponse';
import { RegisterMediaClub } from './definitions/RegisterMediaClub';
import { RegisterMediaClubResponse } from './definitions/RegisterMediaClubResponse';
import { RegisterPo } from './definitions/RegisterPo';
import { RegisterPoResponse } from './definitions/RegisterPoResponse';
import { RegistredCommonCredentials } from './definitions/RegistredCommonCredentials';
import { RegistredCommonCredentialsResponse } from './definitions/RegistredCommonCredentialsResponse';
import { RegistredCredentialsAuthorized } from './definitions/RegistredCredentialsAuthorized';
import { RegistredCredentialsAuthorizedResponse } from './definitions/RegistredCredentialsAuthorizedResponse';
import { SendActivationRequest } from './definitions/SendActivationRequest';
import { SendActivationRequestResponse } from './definitions/SendActivationRequestResponse';
import { ValidateCredentials } from './definitions/ValidateCredentials';
import { ValidateCredentialsResponse } from './definitions/ValidateCredentialsResponse';
import { ValidateEmail } from './definitions/ValidateEmail';
import { ValidateEmailResponse } from './definitions/ValidateEmailResponse';
import { ValidateLogin } from './definitions/ValidateLogin';
import { ValidateLoginResponse } from './definitions/ValidateLoginResponse';
import { ValidatePassword } from './definitions/ValidatePassword';
import { ValidatePasswordResponse } from './definitions/ValidatePasswordResponse';
import { ValidatePhone } from './definitions/ValidatePhone';
import { ValidatePhoneResponse } from './definitions/ValidatePhoneResponse';
import { ValidateRestorePassword } from './definitions/ValidateRestorePassword';
import { ValidateRestorePasswordResponse } from './definitions/ValidateRestorePasswordResponse';
import { Registration } from './services/Registration';

export interface Api2UserRegistrationServiceClient extends SoapClient {
  Registration: Registration;
  BeforeRegisterCredentialsAsync(
    beforeRegisterCredentials: BeforeRegisterCredentials,
  ): Promise<
    [
      result: BeforeRegisterCredentialsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  BeforeRegisterExtAsync(
    beforeRegisterExt: BeforeRegisterExt,
  ): Promise<
    [
      result: BeforeRegisterExtResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetAbonentIdByTokenAsync(
    getAbonentIdByToken: GetAbonentIdByToken,
  ): Promise<
    [
      result: GetAbonentIdByTokenResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetTokenListAsync(
    getTokenList: GetTokenList,
  ): Promise<
    [
      result: GetTokenListResponse,
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
  RegisterAbonentAsync(
    registerAbonent: RegisterAbonent,
  ): Promise<
    [
      result: RegisterAbonentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RegisterLevel2Async(
    registerLevel2: RegisterLevel2,
  ): Promise<
    [
      result: RegisterLevel2Response,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RegisterLevel3Async(
    registerLevel3: RegisterLevel3,
  ): Promise<
    [
      result: RegisterLevel3Response,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RegisterMailBoxAsync(
    registerMailBox: RegisterMailBox,
  ): Promise<
    [
      result: RegisterMailBoxResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RegisterMediaClubAsync(
    registerMediaClub: RegisterMediaClub,
  ): Promise<
    [
      result: RegisterMediaClubResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RegisterPOAsync(
    registerPo: RegisterPo,
  ): Promise<
    [
      result: RegisterPoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RegistredCommonCredentialsAsync(
    registredCommonCredentials: RegistredCommonCredentials,
  ): Promise<
    [
      result: RegistredCommonCredentialsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RegistredCredentialsAuthorizedAsync(
    registredCredentialsAuthorized: RegistredCredentialsAuthorized,
  ): Promise<
    [
      result: RegistredCredentialsAuthorizedResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SendActivationRequestAsync(
    sendActivationRequest: SendActivationRequest,
  ): Promise<
    [
      result: SendActivationRequestResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ValidateCredentialsAsync(
    validateCredentials: ValidateCredentials,
  ): Promise<
    [
      result: ValidateCredentialsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ValidateEmailAsync(
    validateEmail: ValidateEmail,
  ): Promise<
    [
      result: ValidateEmailResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ValidateLoginAsync(
    validateLogin: ValidateLogin,
  ): Promise<
    [
      result: ValidateLoginResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ValidatePasswordAsync(
    validatePassword: ValidatePassword,
  ): Promise<
    [
      result: ValidatePasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ValidatePhoneAsync(
    validatePhone: ValidatePhone,
  ): Promise<
    [
      result: ValidatePhoneResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ValidateRestorePasswordAsync(
    validateRestorePassword: ValidateRestorePassword,
  ): Promise<
    [
      result: ValidateRestorePasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
}

/** Create Api2UserRegistrationServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<Api2UserRegistrationServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
