import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { Cancel } from './definitions/Cancel';
import { CancelResponse } from './definitions/CancelResponse';
import { Confirm } from './definitions/Confirm';
import { ConfirmResponse } from './definitions/ConfirmResponse';
import { Create } from './definitions/Create';
import { CreateResponse } from './definitions/CreateResponse';
import { GetByLogin } from './definitions/GetByLogin';
import { GetByLoginResponse } from './definitions/GetByLoginResponse';
import { GetByPhoneEmail } from './definitions/GetByPhoneEmail';
import { GetByPhoneEmailResponse } from './definitions/GetByPhoneEmailResponse';
import { GetCListConfirmOperationNotAuth } from './definitions/GetCListConfirmOperationNotAuth';
import { GetCListConfirmOperationNotAuthResponse } from './definitions/GetCListConfirmOperationNotAuthResponse';
import { GetControlListConfirmOperation } from './definitions/GetControlListConfirmOperation';
import { GetControlListConfirmOperationResponse } from './definitions/GetControlListConfirmOperationResponse';
import { Login } from './definitions/Login';
import { LoginResponse } from './definitions/LoginResponse';
import { Logout } from './definitions/Logout';
import { LogoutResponse } from './definitions/LogoutResponse';
import { Send } from './definitions/Send';
import { SendResponse } from './definitions/SendResponse';
import { SendById } from './definitions/SendById';
import { SendByIdResponse } from './definitions/SendByIdResponse';
import { SendConfirmCode } from './definitions/SendConfirmCode';
import { SendConfirmCodeResponse } from './definitions/SendConfirmCodeResponse';
import { ActivationRequestService } from './services/ActivationRequestService';

export interface Api2UserActivationRequestServiceClient extends SoapClient {
  ActivationRequestService: ActivationRequestService;
  CancelAsync(
    cancel: Cancel,
  ): Promise<
    [result: CancelResponse, rawResponse: any, soapHeader: any, rawRequest: any]
  >;
  ConfirmAsync(
    confirm: Confirm,
  ): Promise<
    [
      result: ConfirmResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  CreateAsync(
    create: Create,
  ): Promise<
    [result: CreateResponse, rawResponse: any, soapHeader: any, rawRequest: any]
  >;
  GetByLoginAsync(
    getByLogin: GetByLogin,
  ): Promise<
    [
      result: GetByLoginResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetByPhoneEmailAsync(
    getByPhoneEmail: GetByPhoneEmail,
  ): Promise<
    [
      result: GetByPhoneEmailResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCListConfirmOperationNotAuthAsync(
    getCListConfirmOperationNotAuth: GetCListConfirmOperationNotAuth,
  ): Promise<
    [
      result: GetCListConfirmOperationNotAuthResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetControlListConfirmOperationAsync(
    getControlListConfirmOperation: GetControlListConfirmOperation,
  ): Promise<
    [
      result: GetControlListConfirmOperationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  LoginAsync(
    login: Login,
  ): Promise<
    [result: LoginResponse, rawResponse: any, soapHeader: any, rawRequest: any]
  >;
  LogoutAsync(
    logout: Logout,
  ): Promise<
    [result: LogoutResponse, rawResponse: any, soapHeader: any, rawRequest: any]
  >;
  SendAsync(
    send: Send,
  ): Promise<
    [result: SendResponse, rawResponse: any, soapHeader: any, rawRequest: any]
  >;
  SendByIdAsync(
    sendById: SendById,
  ): Promise<
    [
      result: SendByIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SendConfirmCodeAsync(
    sendConfirmCode: SendConfirmCode,
  ): Promise<
    [
      result: SendConfirmCodeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
}

/** Create Api2UserActivationRequestServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<Api2UserActivationRequestServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
