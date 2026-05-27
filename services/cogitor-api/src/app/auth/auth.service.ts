import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { createClientAsync } from '../../../libs/data-access/api2.oauth2.service/src';
import { createClientAsync as registerCreateClientAsync } from '../../../libs/data-access/api2.user.activation.request.service/src';
import { createClientAsync as registerConfirmCreateClientAsync } from '../../../libs/data-access/api2.user.registration.service/src';
import { RequestUrl, WsdlUrl } from '../constants/url.constants';

import { ConfirmDto } from './dtos/confirm.dto';
import { RegisterDto } from './dtos/register.dto';
import { createClientAsync as authCreateClientAsync } from '../../../libs/data-access/api2.user.service/src';
import { ITokenPair } from '../jwt/ITokenPair.interface';
import { EJwtType } from '../jwt/JWTType.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private wsdlUrl: WsdlUrl,
    private requestUrl: RequestUrl,
  ) {}

  parseReg(regObject: any) {
    const container = regObject.Container.ControlList.Control;
    const regData = {
      Description: '',
      RepeatDescription: '',
      ActivationRequestId: '',
      ActivationCode: '',
      SpamWarning: '',
      Email: '',
      Login: '',
      Phone: '',
      Password: '',
      RestorePassword: '',
      FirstName: '',
      SecondName: '',
      Surname: '',
      address: 'не указано, не указано, не указано',
    };
    for (let i = 0; i < container.length; ++i) {
      if (container[i].attributes.Name == 'Description') {
        regData.Description = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'ActivationRequestId') {
        regData.ActivationRequestId = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'Код подтверждения') {
        regData.ActivationCode = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'RepeatDescription') {
        regData.RepeatDescription = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'SpamWarning') {
        regData.SpamWarning = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'Email') {
        regData.Email = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'FirstName') {
        regData.FirstName = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'Login') {
        regData.Login = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'Password') {
        regData.Password = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'Phone') {
        regData.Phone = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'RestorePassword') {
        regData.RestorePassword = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'SecondName') {
        regData.SecondName = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'Surname') {
        regData.Surname = container[i].attributes.Value;
      }
      if (container[i].attributes.Name == 'address') {
        regData.address = container[i].attributes.Value;
      }
    }
    return regData;
  }
  async validateUser(
    ip: string,
    login: string,
    password: string,
  ): Promise<any> {
    return {
      id: await this.getUserId(ip, login, password),
      login: login,
      password: password,
    };
  }

  /**
   * Метод получает идентификатор пользователя
   * @async
   * @param ip - ip адрес, с которого получен запрос
   * @param login - логин пользователя
   * @param password - пароль пользователя
   * @return{string} - идентификатор пользователя
   */
  async getUserId(
    ip: string,
    login: string,
    password: string,
  ): Promise<string> {
    const authClient = await authCreateClientAsync(this.wsdlUrl.AUTH_WSDL_URL);
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.AUTH_URL);
    return await authClient
      .AuthAsync({ IP: ip, Login: login, Passwd: password })
      .then((data) => data[0])
      .then((authResponse) => {
        return authResponse.Result;
      })
      .catch((err) => {
        throw new HttpException(
          err?.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  /**
   * Функция, которая возвращает дату, до которой будет валиден токен.
   * Токен валиден в течении 5 минут после создания.
   * При истечении 3-х минут его нужно обновить.
   * @returns {number}
   */
  generateSecondsSinceEpoch() {
    const now = new Date();
    //	now.setMinutes(now.getMinutes() + 5);
    now.setHours(now.getHours() + 5);
    return Math.round(now.getTime() / 1000);
  }

  async setToken(userId: string, token: string) {
    const authClient = await createClientAsync(this.wsdlUrl.SET_TOKEN_WSDL_URL);
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.SET_TOKEN_URL);
    const expires = this.configService.get(
      `SECURITY_${EJwtType.ACCESS}_TOKEN_EXPIRED`,
    );
    const date = new Date();
    date.setHours(date.getHours() + 5);
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    return authClient
      .SetTokenAsync({
        Token: token.substring(105, 148),
        ClientId: 'cabinet',
        UserId: userId,
        Expires: unixTimestamp.toString(),
      })
      .then((data) => data[0])
      .then((result) => result)
      .catch((err) => {
        throw new HttpException(
          err.root.Envelope.Body.Fault.detail.error.text,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  /*login(user) {
    const payload = { login: user.login, ix: user.userId };
    const access_token = this.jwtService.sign(payload);
    const bd_token = tokenGenerator.generate(30);
    return {
      userId: user.userId,
      access_token: access_token,
      bd_token: bd_token,
    };
  }*/

  async logout(token: string) {
    const userId = this.jwtService.parseToken(token).id;
    const authClient = await createClientAsync(this.wsdlUrl.LOGOUT_WSDL_URL);
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.LOGOUT_URL);
    return await authClient
      .KillUserSessionAsync({ UserId: userId })
      .then((data) => data[0])
      .then((result) => result.Status)
      .catch((err) => {
        throw new HttpException(
          err.root.Envelope.Body.Fault.detail.error.text,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  async signUp(registerDto: RegisterDto) {
    const authClient = await registerCreateClientAsync(
      this.wsdlUrl.REGISTER_WSDL_URL,
    );
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.REGISTER_URL);
    return await authClient
      .GetByPhoneEmailAsync({
        FormInputList: {
          Param: [
            {
              attributes: {
                Key: 'Surname',
              },
              $value: registerDto.surname,
            },
            {
              attributes: {
                Key: 'FirstName',
              },
              $value: registerDto.firstName,
            },
            {
              attributes: {
                Key: 'SecondName',
              },
              $value: registerDto.secondName,
            },
            {
              attributes: {
                Key: 'Login',
              },
              $value: registerDto.login,
            },
            {
              attributes: {
                Key: 'Phone',
              },
              $value: registerDto.phone,
            },
            {
              attributes: {
                Key: 'address',
              },
              $value: registerDto.addressId.toString(),
            },
            {
              attributes: {
                Key: 'Password',
              },
              $value: registerDto.password,
            },
            {
              attributes: {
                Key: 'RestorePassword',
              },
              $value: registerDto.restorePassword,
            },
            {
              attributes: {
                Key: 'Email',
              },
              $value: registerDto.email,
            },
            {
              attributes: {
                Key: 'Client',
              },
              $value: '1',
            },
            {
              attributes: {
                Key: 'ActivationRequestWebMethod',
              },
              $value:
                'API2.User.RegistrationService:RegisterMediaClub(CheckboxOferta,Login,Password,RestorePassword,Surname,\n' +
                '                FirstName,SecondName,Phone,Email,Address,ActivationRequestId,ActivationCode,ReferalId,Client)</www:Param>\n',
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
              $value: '0',
            },
            {
              attributes: {
                Key: 'ActivationRequestShowInputForm',
              },
              $value: '0',
            },
          ],
        },
      })
      .then((data) => data[0])
      .then((result) =>
        this.parseReg(result.ContainerLinkList.ContainerLink[0]),
      )
      .catch((err) => {
        throw new HttpException(
          err.root.Envelope.Body.Fault.detail.error.text,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  async signUpConfirm(confirmDto: ConfirmDto) {
    const authClient = await registerConfirmCreateClientAsync(
      this.wsdlUrl.VALIDATE_REGISTER_FORM_WSDL_URL,
    );
    console.log(confirmDto);
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.VALIDATE_REGISTER_FORM_URL);
    return await authClient
      .RegisterMediaClubAsync({
        CheckboxOferta: '1',
        Login: confirmDto.Login,
        Password: confirmDto.Password,
        Surname: confirmDto.Surname,
        FirstName: confirmDto.FirstName,
        SecondName: confirmDto.SecondName,
        Phone: confirmDto.Phone,
        Email: confirmDto.Email,
        Address: confirmDto.address,
        ActivationRequestId: confirmDto.ActivationRequestId,
        ActivationCode: confirmDto.ActivationCode,
        Client: 'cabinet',
      })
      .then((data) => data[0])
      .then((result) =>
        this.parseReg(result.ContainerLinkList.ContainerLink[0]),
      )
      .catch((err) => {
        throw new HttpException(
          err.root.Envelope.Body.Fault.detail.error.text,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  async validateEmail(email: string) {
    const authClient = await registerConfirmCreateClientAsync(
      this.wsdlUrl.REGISTER_WSDL_CONFIRM_URL,
    );
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.REGISTER_CONFIRM_URL);
    return await authClient
      .ValidateEmailAsync({ Email: email })
      .then((data) => data[0])
      .then((result) => result)
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  async validatePhone(phone: string) {
    const authClient = await registerConfirmCreateClientAsync(
      this.wsdlUrl.REGISTER_WSDL_CONFIRM_URL,
    );
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.REGISTER_CONFIRM_URL);
    return await authClient
      .ValidatePhoneAsync({ Phone: phone })
      .then((data) => data[0])
      .then((result) => result)
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  async validateLogin(login: string) {
    const authClient = await registerConfirmCreateClientAsync(
      this.wsdlUrl.REGISTER_WSDL_CONFIRM_URL,
    );
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.REGISTER_CONFIRM_URL);
    return await authClient
      .ValidateLoginAsync({ Login: login })
      .then((data) => data[0])
      .then((result) => result)
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  public getAuthTokens(payload: any): ITokenPair {
    return this.jwtService.getTokenPair(payload);
  }
}
