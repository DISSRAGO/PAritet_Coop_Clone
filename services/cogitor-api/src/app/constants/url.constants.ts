import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestUrl {
  readonly BASIC_URL = 'https://stend.portmonet.ru';
  MARKET_WSDL_URL = `${this.BASIC_URL}//csp/rkc/ApiExt.Market.Service.cls`;
  readonly MEETING_URL = `${this.BASIC_URL}/csp/rkc/ApiExt.SVS.Service.cls`;
  ADDRESS_URL = `${this.BASIC_URL}/csp/soc/API2.Social.Address.Service.cls`;
  GROUPS_URL = `${this.BASIC_URL}/csp/soc/API2.Social.Group.Service.cls`;
  AUTH_URL = `${this.BASIC_URL}/csp/rkc/API2.User.Service.cls`;
  SET_TOKEN_URL = `${this.BASIC_URL}/csp/rkc/API2.OAuth2.Service.cls`;
  LOGOUT_URL = `${this.BASIC_URL}/csp/rkc/API2.OAuth2.Service.cls`;
  GET_ACCOUNT_URL = `${this.BASIC_URL}/csp/rkc/ApiExt.Paritet.Service.cls`;
  REGISTER_URL = `${this.BASIC_URL}/csp/rkc/API2.User.ActivationRequestService.cls`;
  REGISTER_CONFIRM_URL = `${this.BASIC_URL}/csp/rkc/API2.User.RegistrationService.cls`;
  VALIDATE_REGISTER_FORM_URL = `${this.BASIC_URL}/csp/rkc/API2.User.RegistrationService.cls`;

  PAYMENT_URL1 = `${this.BASIC_URL}/csp/rkc/API2.Interface.Service.cls`;
  PAYMENT_URL2 = `${this.BASIC_URL}/csp/rkc/API2.User.ActivationRequestService.cls`;
  PAYMENT_URL3 = `${this.BASIC_URL}/csp/rkc/API2.Payment.Transfer.Service.cls`;
}

@Injectable()
export class WsdlUrl {
  readonly BASIC_URL = 'https://stend.portmonet.ru';
  MARKET_WSDL_URL = `${this.BASIC_URL}/csp/rkc/ApiExt.Market.Service.cls?WSDL=1`;
  MARKET_WSDL_URL_ADDITIONAL = `${this.BASIC_URL}/csp/soc/API2.Social.Market.Service.cls?WSDL=1`;
  ADDRESS_WSDL_URL = `${this.BASIC_URL}/csp/soc/API2.Social.Address.Service.cls?WSDL=1`;
  AUTH_WSDL_URL = `${this.BASIC_URL}/csp/rkc/API2.User.Service.cls?WSDL=1`;
  SET_TOKEN_WSDL_URL = `${this.BASIC_URL}/csp/rkc/API2.OAuth2.Service.cls?WSDL=1`;
  LOGOUT_WSDL_URL = `${this.BASIC_URL}/csp/rkc/API2.OAuth2.Service.cls?WSDL=1`;
  GET_ACCOUNT_WSDL_URL = `${this.BASIC_URL}/csp/rkc/ApiExt.Paritet.Service.cls?WSDL=1`;
  REGISTER_WSDL_URL = `${this.BASIC_URL}/csp/rkc/API2.User.ActivationRequestService.cls?WSDL=1`;
  REGISTER_WSDL_CONFIRM_URL = `${this.BASIC_URL}/csp/rkc/API2.User.RegistrationService.cls?WSDL=1`;
  VALIDATE_REGISTER_FORM_WSDL_URL = `${this.BASIC_URL}/csp/rkc/API2.User.RegistrationService.cls?WSDL=1`;

  PAYMENT_WSDL_URL1 = `${this.BASIC_URL}/csp/rkc/API2.Interface.Service.cls?WSDL=1`;
  PAYMENT_WSDL_URL2 = `${this.BASIC_URL}/csp/rkc/API2.User.ActivationRequestService.cls?WSDL=1`;
  PAYMENT_WSDL_URL3 = `${this.BASIC_URL}/csp/rkc/API2.Payment.Transfer.Service.cls?WSDL=1`;
}
