import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RequestUrl, WsdlUrl } from '../constants/url.constants';
import { createClientAsync as paymentTransferServiceCreateClentAsync } from '../../../libs/data-access/api2.payment.transfer.service/src';
import {
  createClientAsync as api2InterfaceServiceCreateClientAsync,
  Control,
} from '../../../libs/data-access/api2.interface.service/src';
import { createClientAsync as activationRequestServiceCreateClientAsync } from '../../../libs/data-access/api2.user.activation.request.service/src';
import { PaymentDescriptionDtoInput } from './dtos/input/payment.description.dto.input';
import { ConfirmTransferDto } from './dtos/input/confirm.transfer.dto';
import { TypesPaymentTransferDto } from './dtos/output/types.payment.transfer.dto';
import { PaymentActivationCodeDto } from './dtos/output/payment.activation.code.dto';
@Injectable()
export class PaymentService {
  constructor(private wsdlUrl: WsdlUrl, private requestUrl: RequestUrl) {}

  async parseGetPageByPath(
    controlList: Control[],
  ): Promise<TypesPaymentTransferDto> {
    const answer: TypesPaymentTransferDto = {
      typeTo: [],
      contractFrom: [],
    };
    for (let i = 0; i < controlList.length; ++i) {
      if (controlList[i].attributes.ServerId == 'ContractFrom') {
        for (let j = 0; j < controlList[i].ChildrenList.Control.length; ++j) {
          answer.contractFrom.push({
            name: controlList[i].ChildrenList.Control[j].attributes.Name,
            value: controlList[i].ChildrenList.Control[j].attributes.Value,
          });
        }
      }
      if (controlList[i].attributes.ServerId == 'TypeTo') {
        for (let j = 0; j < controlList[i].ChildrenList.Control.length; ++j) {
          answer.typeTo.push({
            name: controlList[i].ChildrenList.Control[j].attributes.Name,
            value: controlList[i].ChildrenList.Control[j].attributes.Value,
          });
        }
      }
    }
    return answer;
  }

  /**
   * ШАГ 1. Для перевода денег другому пользователю
   * В ответе можно TypeTo и ContractFrom
   *
   * @async
   * @function step1
   * @returns {Promise<Array<CountryDto>>} Возвращает promise со списком стран
   * @param token{string} - токен пользователя
   */
  async getTypesPaymentTransfer(
    token: string,
  ): Promise<TypesPaymentTransferDto> {
    const paymentClient = await api2InterfaceServiceCreateClientAsync(
      this.wsdlUrl.PAYMENT_WSDL_URL1,
    );
    //paymentClient.addSoapHeader({ connection: 'keep-alive' });
    paymentClient.addHttpHeader('Access-Token', token.substring(105, 148));
    //paymentClient.setEndpoint(this.requestUrl.PAYMENT_URL1);
    return paymentClient
      .GetPageByPathAsync({ Path: 'Transfer' })
      .then((data) => data[0])
      .then((response) => {
        return this.parseGetPageByPath(
          response.Result.ChildrenList.Container[0].ControlList.Control,
        );
      })
      .catch((err) => {
        throw new HttpException(
          err.root.Envelope.Body.Fault.detail.error.text,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  /**
   * ШАГ 2 API2.User.ActivationRequestService GetControlListConfirmOperation
   * с набором параметров
   * получаем ActivationRequestId, а пользователю уходит код подтверждения
   *
   * @async
   * @function getCountryList
   * @returns {Promise<Array<CountryDto>>} Возвращает promise со списком стран
   * @param token{string} - токен пользователя
   * @param dto
   */
  async transferMoney(
    token: string,
    dto: PaymentDescriptionDtoInput,
  ): Promise<PaymentActivationCodeDto> {
    const paymentClient = await activationRequestServiceCreateClientAsync(
      this.wsdlUrl.PAYMENT_WSDL_URL2,
    );
    paymentClient.addSoapHeader({ connection: 'keep-alive' });
    paymentClient.addHttpHeader('Access-Token', token.substring(105, 148));
    paymentClient.setEndpoint(this.requestUrl.PAYMENT_URL2);
    return paymentClient
      .GetControlListConfirmOperationAsync({
        FormInputList: {
          Param: [
            {
              attributes: {
                Key: 'Amount',
              },
              $value: dto.amount,
            },
            {
              attributes: {
                Key: 'TypeTo',
              },
              $value: dto.typeTo,
            },
            {
              attributes: {
                Key: 'ValueTo',
              },
              $value: dto.login,
            },
            {
              attributes: {
                Key: 'Description',
              },
              $value: dto.description,
            },
            {
              attributes: {
                Key: 'ActivationRequestWebMethod',
              },
              $value:
                'API2.Payment.Transfer.Service:Pay(ActivationRequestId,ActivationCode,ContractFrom,Amount,TypeTo,ValueTo,Description',
            },
            {
              attributes: {
                Key: 'ActivationRequestShowTransport',
              },
              $value: '1',
            },
            {
              attributes: {
                Key: 'ActivationRequestShowTransportParam',
              },
              $value: '1',
            },
            {
              attributes: {
                Key: 'ActivationRequestShowInputForm',
              },
              $value: '1',
            },
          ],
        },
      })
      .then((data) => data[0])
      .then((response) => {
        const control =
          response.ContainerLinkList.ContainerLink[0].Container.ControlList
            .Control;
        const answer: PaymentActivationCodeDto = {
          ActivationRequestId: '',
          OperationId: '',
          ActivationCode: '',
        };
        for (let i = 0; i < control.length; ++i) {
          if (control[i].attributes.ServerId == 'ActivationCode') {
            answer.ActivationCode = control[i].attributes.Value;
          }
          if (control[i].attributes.ServerId == 'ActivationRequestId') {
            answer.ActivationRequestId = control[i].attributes.Value;
          }
          if (control[i].attributes.ServerId == 'OperationId') {
            answer.OperationId = control[i].attributes.Value;
          }
        }
        return answer;
      })
      .catch((err) => {
        throw new HttpException(
          err.root.Envelope.Body.Fault.detail.error.text,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  /**
   * ШАГ 3 API2.Payment.Transfer.Service : Pay
   * TypeTo - из ответа ШАГ 1
   * ContractFrom - из ответа ШАГ 1
   * ActivationRequestId - из ответа ШАГ 2
   * ActivationCode - вводит пользователь
   *
   * @async
   * @function step3
   * @returns {Promise<Array<CountryDto>>} Возвращает promise со списком стран
   * @param token{string} - токен пользователя
   * @param dto
   */
  async confirmMoneyTransfer(
    token: string,
    dto: ConfirmTransferDto,
  ): Promise<any> {
    const paymentClient = await paymentTransferServiceCreateClentAsync(
      this.wsdlUrl.PAYMENT_WSDL_URL3,
    );
    paymentClient.addSoapHeader({ connection: 'keep-alive' });
    paymentClient.addHttpHeader('Access-Token', token.substring(105, 148));
    paymentClient.setEndpoint(this.requestUrl.PAYMENT_URL3);
    return paymentClient
      .PayAsync({
        ActivationRequestId: dto.activationRequestId,
        ActivationCode: dto.activationCode,
        ContractFrom: dto.contractFrom,
        Amount: dto.amount,
        TypeTo: dto.typeTo,
        ValueTo: dto.valueTo,
        Description: dto.description,
      })
      .then((data) => data[0])
      .then((response) => response.ContainerLinkList)
      .catch((err) => {
        throw new HttpException(
          err.root.Envelope.Body.Fault.detail.error.text,
          HttpStatus.NOT_FOUND,
        );
      });
  }
}
