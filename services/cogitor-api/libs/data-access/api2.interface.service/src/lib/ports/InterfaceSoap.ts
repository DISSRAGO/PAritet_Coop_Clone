import { GetContainer } from '../definitions/GetContainer';
import { GetContainerResponse } from '../definitions/GetContainerResponse';
import { GetContainerByPath } from '../definitions/GetContainerByPath';
import { GetContainerByPathResponse } from '../definitions/GetContainerByPathResponse';
import { GetContainerByServerId } from '../definitions/GetContainerByServerId';
import { GetContainerByServerIdResponse } from '../definitions/GetContainerByServerIdResponse';
import { GetContainerNotAuth } from '../definitions/GetContainerNotAuth';
import { GetContainerNotAuthResponse } from '../definitions/GetContainerNotAuthResponse';
import { GetContainerWithAdditional } from '../definitions/GetContainerWithAdditional';
import { GetContainerWithAdditionalResponse } from '../definitions/GetContainerWithAdditionalResponse';
import { GetPage } from '../definitions/GetPage';
import { GetPageResponse } from '../definitions/GetPageResponse';
import { GetPageByPath } from '../definitions/GetPageByPath';
import { GetPageByPathResponse } from '../definitions/GetPageByPathResponse';
import { RefreshWsdl } from '../definitions/RefreshWsdl';
import { RefreshWsdlResponse } from '../definitions/RefreshWsdlResponse';

export interface InterfaceSoap {
  GetContainer(
    getContainer: GetContainer,
    callback: (
      err: any,
      result: GetContainerResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetContainerByPath(
    getContainerByPath: GetContainerByPath,
    callback: (
      err: any,
      result: GetContainerByPathResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetContainerByServerId(
    getContainerByServerId: GetContainerByServerId,
    callback: (
      err: any,
      result: GetContainerByServerIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetContainerNotAuth(
    getContainerNotAuth: GetContainerNotAuth,
    callback: (
      err: any,
      result: GetContainerNotAuthResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetContainerWithAdditional(
    getContainerWithAdditional: GetContainerWithAdditional,
    callback: (
      err: any,
      result: GetContainerWithAdditionalResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetPage(
    getPage: GetPage,
    callback: (
      err: any,
      result: GetPageResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetPageByPath(
    getPageByPath: GetPageByPath,
    callback: (
      err: any,
      result: GetPageByPathResponse,
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
}
