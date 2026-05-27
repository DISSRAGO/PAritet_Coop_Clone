import { AuthClient } from '../definitions/AuthClient';
import { AuthClientResponse } from '../definitions/AuthClientResponse';
import { GetClient } from '../definitions/GetClient';
import { GetClientResponse } from '../definitions/GetClientResponse';
import { GetCode } from '../definitions/GetCode';
import { GetCodeResponse } from '../definitions/GetCodeResponse';
import { GetToken } from '../definitions/GetToken';
import { GetTokenResponse } from '../definitions/GetTokenResponse';
import { KillUserSession } from '../definitions/KillUserSession';
import { KillUserSessionResponse } from '../definitions/KillUserSessionResponse';
import { RefreshWsdl } from '../definitions/RefreshWsdl';
import { RefreshWsdlResponse } from '../definitions/RefreshWsdlResponse';
import { SetCode } from '../definitions/SetCode';
import { SetCodeResponse } from '../definitions/SetCodeResponse';
import { SetToken } from '../definitions/SetToken';
import { SetTokenResponse } from '../definitions/SetTokenResponse';

export interface OAuth2Soap {
  AuthClient(
    authClient: AuthClient,
    callback: (
      err: any,
      result: AuthClientResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetClient(
    getClient: GetClient,
    callback: (
      err: any,
      result: GetClientResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCode(
    getCode: GetCode,
    callback: (
      err: any,
      result: GetCodeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetToken(
    getToken: GetToken,
    callback: (
      err: any,
      result: GetTokenResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  KillUserSession(
    killUserSession: KillUserSession,
    callback: (
      err: any,
      result: KillUserSessionResponse,
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
  SetCode(
    setCode: SetCode,
    callback: (
      err: any,
      result: SetCodeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SetToken(
    setToken: SetToken,
    callback: (
      err: any,
      result: SetTokenResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
}
