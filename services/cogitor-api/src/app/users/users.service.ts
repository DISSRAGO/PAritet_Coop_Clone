import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RequestUrl, WsdlUrl } from "../constants/url.constants";
import { GetUserProfileDto } from "./dtos/output/get.user.profile.dto";
import { HeaderInfoDto } from "./dtos/header-info.dto";
import { AppLogger } from "../logger/logger.service";
import { OperationsHistoryInputDto } from "./dtos/input/operations.history.dto";
import { UserConverter } from "./UserConverter";
import { Account, createClientAsync } from "../../../libs/data-access/api.ext.paritet.service/src";
import { AccountDto } from "./dtos/account.dto";
import { JwtService } from "../jwt/jwt.service";
import { OperationHistoryOutDto } from "./dtos/output/operation-history.dto";
import { AccountOperationDto } from "./dtos/output/account-operation.dto";

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    private wsdlUrl: WsdlUrl,
    private requestUrl: RequestUrl,
    private logger: AppLogger,
  ) {}

  /**
   * Метод, который позволяет получать информацию о профиле пользователя
   * @param token{string} - токен для доступа к бд
   */
  async getProfileInformation(token: string): Promise<GetUserProfileDto> {
    this.logger.log(`Получение профиля пользователя....`);
    const authClient = await createClientAsync(
      this.wsdlUrl.GET_ACCOUNT_WSDL_URL,
    );
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.addHttpHeader('Access-Token', token.substring(105, 148));
    return await authClient
      .GetShareHolderAsync({
        PropertyList: {
          PropertyListItem: ['UserProfile', 'UserProfile.%All'],
        },
      })
      .then((data) => data[0])
      .then((data) => {
        this.logger.log(`Профиль из бд ${JSON.stringify(data)}`);
        const result =
          UserConverter.convertUserProfileAddressFromDatabaseToModel(
            data.ShareHolder.UserProfile,
          );
        this.logger.log(
          `Профиль после преобразования: ${JSON.stringify(result)}`,
        );
        return result;
      })
      .catch((err) => {
        this.logger.error(`${this.getProfileInformation.name} ${err}`);
        throw new HttpException(
          err?.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  /**
   * Метод, позволяющий сохранять информацию о пользователе
   * @param userProfile{GetUserProfileDto}
   * @param token{string}
   */
  async saveProfileInformation(
    userProfile: GetUserProfileDto,
    token: string,
  ): Promise<GetUserProfileDto> {
    this.logger.log(
      `Сохранение основной информации пользователя ${userProfile.login}`,
    );
    this.logger.log(`Профиль: ${userProfile}`);
    const authClient = await createClientAsync(
      this.wsdlUrl.GET_ACCOUNT_WSDL_URL,
    );
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.addHttpHeader('Access-Token', token.substring(105, 148));
    authClient.setEndpoint(this.requestUrl.GET_ACCOUNT_URL);
    return await authClient
      .SaveUserProfileAsync(
        UserConverter.convertUserProfileFromModelToDatabase(userProfile),
      )
      .then((data) => data[0].Status)
      .catch((err) => {
        this.logger.error(`${this.getProfileInformation.name} ${err}`);
        throw new HttpException(
          err?.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  async saveProfileAddress(
    userProfile: GetUserProfileDto,
    token: string,
  ): Promise<GetUserProfileDto> {
    this.logger.log(`Сохранение адреса пользователя ${userProfile.login}`);
    const authClient = await createClientAsync(
      this.wsdlUrl.GET_ACCOUNT_WSDL_URL,
    );
    authClient.addHttpHeader('Access-Token', token.substring(105, 148));
    authClient.setEndpoint(this.requestUrl.GET_ACCOUNT_URL);
    return await authClient
      .SaveUserProfileAsync(
        UserConverter.convertUserProfileAddressFromModelToDatabase(userProfile),
      )
      .then((data) => {
        this.logger.log(
          `Результат сохранения профиля пользователя ${userProfile.login}: ${data[0].Status}`,
        );
        return data[0].Status;
      })
      .catch((err) => {
        this.logger.error(`${this.getProfileInformation.name} ${err}`);
        throw new HttpException(
          err?.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  async getHeaderInfo(token: string): Promise<HeaderInfoDto> {
    this.logger.log(
      'Получение информации основной информации о пользователе...',
    );

    const authClient = await createClientAsync(
      this.wsdlUrl.GET_ACCOUNT_WSDL_URL,
    );
    authClient.setEndpoint(this.requestUrl.GET_ACCOUNT_URL);
    authClient.addHttpHeader('Access-Token', token.substring(105, 148));
    return await authClient
      .GetShareHolderAsync({
        PropertyList: {
          PropertyListItem: [
            'UserProfile',
            'UserProfile.Id',
            'UserProfile.Login',
            'UserProfile.Name',
            'UserProfile.EMail',
            'UserProfile.PhotoImage',
          ],
        },
      })
      .then((data) => {
        this.logger.log('Основная информация получена');
        this.logger.log(`Информация о пользователя ${data[0]}`);
        return UserConverter.convertHeaderInfoFromDatabaseToModel(
          data[0].ShareHolder.UserProfile,
        );
      })
      .catch((err) => {
        this.logger.error(`${this.getProfileInformation.name} ${err}`);
        throw new HttpException(
          err?.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  parseAccount(account: Account): AccountDto {
    const accountDto: AccountDto = {
      id: Number.parseInt(account.attributes.Id),
      numberOfAccount: Number.parseInt(account.attributes.Number),
      fullNumber: account.attributes.FullNumber,
      amount: Number.parseInt(account.Money.attributes.Amount),
      currency: {
        id: Number.parseInt(account.Money.Currency.attributes.Id),
        name: account.Money.Currency.attributes.Name,
        currencyType: account.Money.Currency.attributes.Type,
      },
    };
    return accountDto;
  }
  async getAccount(token: string): Promise<any> {
    this.logger.log(`Получение информации об аккаунте пользователя`);
    const authClient = await createClientAsync(
      this.wsdlUrl.GET_ACCOUNT_WSDL_URL,
    );
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.GET_ACCOUNT_URL);
    authClient.addHttpHeader('Access-Token', token.substring(105, 148));
    return await authClient
      .GetShareHolderAsync({
        PropertyList: {
          PropertyListItem: [
            'Account',
            'Account.%All',
            'AccountMoney.%All',
            'Debts',
            'PayLink',
          ],
        },
      })
      .then((data) => data[0])
      .then((data) => {
        const account = this.parseAccount(data.ShareHolder.Account);
        return {
          account: account,
          payLink: data.ShareHolder.PayLink,
        };
      })
      .catch((err) => {
        this.logger.error(`${this.getProfileInformation.name} ${err}`);
        throw new HttpException(
          err?.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  async getOperationHistoryByAccount(
    dto: OperationsHistoryInputDto,
    token: string,
  ): Promise<OperationHistoryOutDto> {
    this.logger.log(`Получение истории переводов...`);
    this.logger.log(`Параметры: ${dto}`);
    const userId = this.jwtService.parseToken(token).id;
    const authClient = await createClientAsync(
      this.wsdlUrl.GET_ACCOUNT_WSDL_URL,
    );
    authClient.addSoapHeader({ connection: 'keep-alive' });
    authClient.setEndpoint(this.requestUrl.GET_ACCOUNT_URL);
    authClient.addHttpHeader('Access-Token', token.substring(105, 148));
    return await authClient
      .GetOperationHistoryByAccountAsync({
        UserId: userId,
        AccountId: dto.accountId,
        DateBegin: dto.dateBegin,
        DateEnd: dto.dateEnd,
      })
      .then((data) => {
        this.logger.log(`Информация о переводе из базы: ${data[0].toString()}`);
        const history: OperationHistoryOutDto = {
          balanceBegin: data[0].BalanceBegin,
          balanceEnd: data[0].BalanceEnd,
          totalDebit: data[0].TotalDebit,
          totalCredit: data[0].TotalCredit,
          operationList: [],
        };
        if (data[0].OperationList) {
          for (
            let i = 0;
            i < data[0].OperationList.AccountOperation.length;
            ++i
          ) {
            const item: AccountOperationDto = {
              rest: data[0].OperationList.AccountOperation[i].Rest,
              date: data[0].OperationList.AccountOperation[i].Date,
              from: data[0].OperationList.AccountOperation[i].From,
              to: data[0].OperationList.AccountOperation[i].To,
              description:
                data[0].OperationList.AccountOperation[i].Description,
              type: data[0].OperationList.AccountOperation[i].Type,
              value: data[0].OperationList.AccountOperation[i].Value,
              IP: data[0].OperationList.AccountOperation[i].IP,
            };
            history.operationList.push(item);
          }
        }
        return history;
      })
      .catch((err) => {
        this.logger.error(`${this.getProfileInformation.name} ${err}`);
        throw new HttpException(
          err?.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.BAD_REQUEST,
        );
      });
  }
}
