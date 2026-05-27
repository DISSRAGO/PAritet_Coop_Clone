import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { Pay } from './definitions/Pay';
import { PayResponse } from './definitions/PayResponse';
import { RefreshWsdl } from './definitions/RefreshWsdl';
import { RefreshWsdlResponse } from './definitions/RefreshWsdlResponse';
import { PaymentTransfer } from './services/PaymentTransfer';

export interface Api2PaymentTransferServiceClient extends SoapClient {
  PaymentTransfer: PaymentTransfer;
  PayAsync(
    pay: Pay,
  ): Promise<
    [result: PayResponse, rawResponse: any, soapHeader: any, rawRequest: any]
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

/** Create Api2PaymentTransferServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<Api2PaymentTransferServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
