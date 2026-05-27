import { Pay } from '../definitions/Pay';
import { PayResponse } from '../definitions/PayResponse';
import { RefreshWsdl } from '../definitions/RefreshWsdl';
import { RefreshWsdlResponse } from '../definitions/RefreshWsdlResponse';

export interface PaymentTransferSoap {
  Pay(
    pay: Pay,
    callback: (
      err: any,
      result: PayResponse,
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
