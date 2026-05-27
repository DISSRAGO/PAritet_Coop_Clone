import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { AuthClient } from './definitions/AuthClient';
import { AuthClientResponse } from './definitions/AuthClientResponse';
import { GetClient } from './definitions/GetClient';
import { GetClientResponse } from './definitions/GetClientResponse';
import { GetCode } from './definitions/GetCode';
import { GetCodeResponse } from './definitions/GetCodeResponse';
import { GetToken } from './definitions/GetToken';
import { GetTokenResponse } from './definitions/GetTokenResponse';
import { KillUserSession } from './definitions/KillUserSession';
import { KillUserSessionResponse } from './definitions/KillUserSessionResponse';
import { RefreshWsdl } from './definitions/RefreshWsdl';
import { RefreshWsdlResponse } from './definitions/RefreshWsdlResponse';
import { SetCode } from './definitions/SetCode';
import { SetCodeResponse } from './definitions/SetCodeResponse';
import { SetToken } from './definitions/SetToken';
import { SetTokenResponse } from './definitions/SetTokenResponse';
import { OAuth2 } from './services/OAuth2';

export interface Api2OAuth2ServiceClient extends SoapClient {
  OAuth2: OAuth2;
  AuthClientAsync(
    authClient: AuthClient,
  ): Promise<
    [
      result: AuthClientResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetClientAsync(
    getClient: GetClient,
  ): Promise<
    [
      result: GetClientResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCodeAsync(
    getCode: GetCode,
  ): Promise<
    [
      result: GetCodeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetTokenAsync(
    getToken: GetToken,
  ): Promise<
    [
      result: GetTokenResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  KillUserSessionAsync(
    killUserSession: KillUserSession,
  ): Promise<
    [
      result: KillUserSessionResponse,
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
  SetCodeAsync(
    setCode: SetCode,
  ): Promise<
    [
      result: SetCodeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SetTokenAsync(
    setToken: SetToken,
  ): Promise<
    [
      result: SetTokenResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
}

/** Create Api2OAuth2ServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<Api2OAuth2ServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
