import { IOperationHistory } from "../models/profile/IOperationHistory";
import { IHeaderInfo } from "../models/profile/IHeaderInfo";
import { IUserProfile } from "../models/profile/IUserProfile";
import { IAccount } from "../models/profile/IAccount";
import { apiFetch } from "../utils/http";
import { Urls } from "../utils/urls";

export default class UserService {
  static async getProfile(): Promise<IUserProfile> {
    const response = await apiFetch(Urls.GET_PROFILE_URL, {
      method: "GET",
    });

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response.json();
  }

  static async saveUserProfile(userProfile: IUserProfile): Promise<string> {
    const response = await apiFetch(Urls.GET_PROFILE_URL, {
      method: "POST",
      body: JSON.stringify({ userProfile }),
    });

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response.json();
  }

  static async saveUserProfileAddress(
    userProfile: IUserProfile
  ): Promise<string> {
    const response = await apiFetch(Urls.SAVE_PROFILE_ADDRESS_URL, {
      method: "POST",
      body: JSON.stringify({ userProfile }),
    });

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response.json();
  }

  static async getHeaderInformation(): Promise<IHeaderInfo> {
    const response = await apiFetch(Urls.GET_HEADER_INFO_URL, {
      method: "GET",
    });

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response.json();
  }

  static async getAccount(): Promise<IAccount> {
    const response = await apiFetch(Urls.GET_ACCOUNT_URL, {
      method: "GET",
    });

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response.json();
  }

  static async getOperationHistoryByAccount(
    accountId: string,
    dateBegin: string,
    dateEnd: string
  ): Promise<IOperationHistory> {
    const response = await apiFetch(
      `${Urls.GET_OPERATION_HISTORY_URL}?accountId=${accountId}&dateBegin=${dateBegin}&dateEnd=${dateEnd}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response.json();
  }
}