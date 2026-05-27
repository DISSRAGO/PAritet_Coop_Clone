import { Cancel } from '../definitions/Cancel';
import { CancelResponse } from '../definitions/CancelResponse';
import { Confirm } from '../definitions/Confirm';
import { ConfirmResponse } from '../definitions/ConfirmResponse';
import { Create } from '../definitions/Create';
import { CreateResponse } from '../definitions/CreateResponse';
import { GetByLogin } from '../definitions/GetByLogin';
import { GetByLoginResponse } from '../definitions/GetByLoginResponse';
import { GetByPhoneEmail } from '../definitions/GetByPhoneEmail';
import { GetByPhoneEmailResponse } from '../definitions/GetByPhoneEmailResponse';
import { GetCListConfirmOperationNotAuth } from '../definitions/GetCListConfirmOperationNotAuth';
import { GetCListConfirmOperationNotAuthResponse } from '../definitions/GetCListConfirmOperationNotAuthResponse';
import { GetControlListConfirmOperation } from '../definitions/GetControlListConfirmOperation';
import { GetControlListConfirmOperationResponse } from '../definitions/GetControlListConfirmOperationResponse';
import { Login } from '../definitions/Login';
import { LoginResponse } from '../definitions/LoginResponse';
import { Logout } from '../definitions/Logout';
import { LogoutResponse } from '../definitions/LogoutResponse';
import { Send } from '../definitions/Send';
import { SendResponse } from '../definitions/SendResponse';
import { SendById } from '../definitions/SendById';
import { SendByIdResponse } from '../definitions/SendByIdResponse';
import { SendConfirmCode } from '../definitions/SendConfirmCode';
import { SendConfirmCodeResponse } from '../definitions/SendConfirmCodeResponse';

export interface ActivationRequestServiceSoap {
  Cancel(
    cancel: Cancel,
    callback: (
      err: any,
      result: CancelResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  Confirm(
    confirm: Confirm,
    callback: (
      err: any,
      result: ConfirmResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  Create(
    create: Create,
    callback: (
      err: any,
      result: CreateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetByLogin(
    getByLogin: GetByLogin,
    callback: (
      err: any,
      result: GetByLoginResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetByPhoneEmail(
    getByPhoneEmail: GetByPhoneEmail,
    callback: (
      err: any,
      result: GetByPhoneEmailResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCListConfirmOperationNotAuth(
    getCListConfirmOperationNotAuth: GetCListConfirmOperationNotAuth,
    callback: (
      err: any,
      result: GetCListConfirmOperationNotAuthResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetControlListConfirmOperation(
    getControlListConfirmOperation: GetControlListConfirmOperation,
    callback: (
      err: any,
      result: GetControlListConfirmOperationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  Login(
    login: Login,
    callback: (
      err: any,
      result: LoginResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  Logout(
    logout: Logout,
    callback: (
      err: any,
      result: LogoutResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  Send(
    send: Send,
    callback: (
      err: any,
      result: SendResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SendById(
    sendById: SendById,
    callback: (
      err: any,
      result: SendByIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SendConfirmCode(
    sendConfirmCode: SendConfirmCode,
    callback: (
      err: any,
      result: SendConfirmCodeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
}
