import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { GetContainer } from './definitions/GetContainer';
import { GetContainerResponse } from './definitions/GetContainerResponse';
import { GetContainerByPath } from './definitions/GetContainerByPath';
import { GetContainerByPathResponse } from './definitions/GetContainerByPathResponse';
import { GetContainerByServerId } from './definitions/GetContainerByServerId';
import { GetContainerByServerIdResponse } from './definitions/GetContainerByServerIdResponse';
import { GetContainerNotAuth } from './definitions/GetContainerNotAuth';
import { GetContainerNotAuthResponse } from './definitions/GetContainerNotAuthResponse';
import { GetContainerWithAdditional } from './definitions/GetContainerWithAdditional';
import { GetContainerWithAdditionalResponse } from './definitions/GetContainerWithAdditionalResponse';
import { GetPage } from './definitions/GetPage';
import { GetPageResponse } from './definitions/GetPageResponse';
import { GetPageByPath } from './definitions/GetPageByPath';
import { GetPageByPathResponse } from './definitions/GetPageByPathResponse';
import { RefreshWsdl } from './definitions/RefreshWsdl';
import { RefreshWsdlResponse } from './definitions/RefreshWsdlResponse';
import { Interface } from './services/Interface';

export interface Api2InterfaceServiceClient extends SoapClient {
  Interface: Interface;
  GetContainerAsync(
    getContainer: GetContainer,
  ): Promise<
    [
      result: GetContainerResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetContainerByPathAsync(
    getContainerByPath: GetContainerByPath,
  ): Promise<
    [
      result: GetContainerByPathResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetContainerByServerIdAsync(
    getContainerByServerId: GetContainerByServerId,
  ): Promise<
    [
      result: GetContainerByServerIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetContainerNotAuthAsync(
    getContainerNotAuth: GetContainerNotAuth,
  ): Promise<
    [
      result: GetContainerNotAuthResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetContainerWithAdditionalAsync(
    getContainerWithAdditional: GetContainerWithAdditional,
  ): Promise<
    [
      result: GetContainerWithAdditionalResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetPageAsync(
    getPage: GetPage,
  ): Promise<
    [
      result: GetPageResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetPageByPathAsync(
    getPageByPath: GetPageByPath,
  ): Promise<
    [
      result: GetPageByPathResponse,
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
}

/** Create Api2InterfaceServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<Api2InterfaceServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
