import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { AddConstructiveElementExtendedValue } from './definitions/AddConstructiveElementExtendedValue';
import { AddConstructiveElementExtendedValueResponse } from './definitions/AddConstructiveElementExtendedValueResponse';
import { AddFlatExtendedValue } from './definitions/AddFlatExtendedValue';
import { AddFlatExtendedValueResponse } from './definitions/AddFlatExtendedValueResponse';
import { AddHouseModerator } from './definitions/AddHouseModerator';
import { AddHouseModeratorResponse } from './definitions/AddHouseModeratorResponse';
import { CreateConstructiveElement } from './definitions/CreateConstructiveElement';
import { CreateConstructiveElementResponse } from './definitions/CreateConstructiveElementResponse';
import { EditAdditionalHouseInformation } from './definitions/EditAdditionalHouseInformation';
import { EditAdditionalHouseInformationResponse } from './definitions/EditAdditionalHouseInformationResponse';
import { EditBaseHouseInformation } from './definitions/EditBaseHouseInformation';
import { EditBaseHouseInformationResponse } from './definitions/EditBaseHouseInformationResponse';
import { EditConstructiveElementInformation } from './definitions/EditConstructiveElementInformation';
import { EditConstructiveElementInformationResponse } from './definitions/EditConstructiveElementInformationResponse';
import { EditFlatInformation } from './definitions/EditFlatInformation';
import { EditFlatInformationResponse } from './definitions/EditFlatInformationResponse';
import { EditManagementCompanyInformation } from './definitions/EditManagementCompanyInformation';
import { EditManagementCompanyInformationResponse } from './definitions/EditManagementCompanyInformationResponse';
import { FindManagementCompany } from './definitions/FindManagementCompany';
import { FindManagementCompanyResponse } from './definitions/FindManagementCompanyResponse';
import { GetAddressFullIds } from './definitions/GetAddressFullIds';
import { GetAddressFullIdsResponse } from './definitions/GetAddressFullIdsResponse';
import { GetAddressList } from './definitions/GetAddressList';
import { GetAddressListResponse } from './definitions/GetAddressListResponse';
import { GetAvatarStatusInHouse } from './definitions/GetAvatarStatusInHouse';
import { GetAvatarStatusInHouseResponse } from './definitions/GetAvatarStatusInHouseResponse';
import { GetCityList } from './definitions/GetCityList';
import { GetCityListResponse } from './definitions/GetCityListResponse';
import { GetConstructiveElementInformation } from './definitions/GetConstructiveElementInformation';
import { GetConstructiveElementInformationResponse } from './definitions/GetConstructiveElementInformationResponse';
import { GetConstructiveElementTypes } from './definitions/GetConstructiveElementTypes';
import { GetConstructiveElementTypesResponse } from './definitions/GetConstructiveElementTypesResponse';
import { GetConstructiveElementValueHistory } from './definitions/GetConstructiveElementValueHistory';
import { GetConstructiveElementValueHistoryResponse } from './definitions/GetConstructiveElementValueHistoryResponse';
import { GetCountHouse } from './definitions/GetCountHouse';
import { GetCountHouseResponse } from './definitions/GetCountHouseResponse';
import { GetCountryList } from './definitions/GetCountryList';
import { GetCountryListResponse } from './definitions/GetCountryListResponse';
import { GetFlatInformation } from './definitions/GetFlatInformation';
import { GetFlatInformationResponse } from './definitions/GetFlatInformationResponse';
import { GetFlatPopulation } from './definitions/GetFlatPopulation';
import { GetFlatPopulationResponse } from './definitions/GetFlatPopulationResponse';
import { GetFlatValueHistory } from './definitions/GetFlatValueHistory';
import { GetFlatValueHistoryResponse } from './definitions/GetFlatValueHistoryResponse';
import { GetHouseAvatarByUrl } from './definitions/GetHouseAvatarByUrl';
import { GetHouseAvatarByUrlResponse } from './definitions/GetHouseAvatarByUrlResponse';
import { GetHouseAvatarIdByHouseId } from './definitions/GetHouseAvatarIdByHouseId';
import { GetHouseAvatarIdByHouseIdResponse } from './definitions/GetHouseAvatarIdByHouseIdResponse';
import { GetHouseIdByUrl } from './definitions/GetHouseIdByUrl';
import { GetHouseIdByUrlResponse } from './definitions/GetHouseIdByUrlResponse';
import { GetHouseInfo } from './definitions/GetHouseInfo';
import { GetHouseInfoResponse } from './definitions/GetHouseInfoResponse';
import { GetHouseInformation } from './definitions/GetHouseInformation';
import { GetHouseInformationResponse } from './definitions/GetHouseInformationResponse';
import { GetHouseList } from './definitions/GetHouseList';
import { GetHouseListResponse } from './definitions/GetHouseListResponse';
import { GetHouseListByStreetName } from './definitions/GetHouseListByStreetName';
import { GetHouseListByStreetNameResponse } from './definitions/GetHouseListByStreetNameResponse';
import { GetHouseModerators } from './definitions/GetHouseModerators';
import { GetHouseModeratorsResponse } from './definitions/GetHouseModeratorsResponse';
import { GetHousePopulation } from './definitions/GetHousePopulation';
import { GetHousePopulationResponse } from './definitions/GetHousePopulationResponse';
import { GetHouseUrlByHouseId } from './definitions/GetHouseUrlByHouseId';
import { GetHouseUrlByHouseIdResponse } from './definitions/GetHouseUrlByHouseIdResponse';
import { GetHouseValueHistory } from './definitions/GetHouseValueHistory';
import { GetHouseValueHistoryResponse } from './definitions/GetHouseValueHistoryResponse';
import { GetManageCompanyList } from './definitions/GetManageCompanyList';
import { GetManageCompanyListResponse } from './definitions/GetManageCompanyListResponse';
import { GetManagementCompanyInformation } from './definitions/GetManagementCompanyInformation';
import { GetManagementCompanyInformationResponse } from './definitions/GetManagementCompanyInformationResponse';
import { GetObjectPropertyList } from './definitions/GetObjectPropertyList';
import { GetObjectPropertyListResponse } from './definitions/GetObjectPropertyListResponse';
import { GetRegionList } from './definitions/GetRegionList';
import { GetRegionListResponse } from './definitions/GetRegionListResponse';
import { GetRegisteredCityList } from './definitions/GetRegisteredCityList';
import { GetRegisteredCityListResponse } from './definitions/GetRegisteredCityListResponse';
import { GetRegisteredHouseList } from './definitions/GetRegisteredHouseList';
import { GetRegisteredHouseListResponse } from './definitions/GetRegisteredHouseListResponse';
import { GetRegisteredStreetList } from './definitions/GetRegisteredStreetList';
import { GetRegisteredStreetListResponse } from './definitions/GetRegisteredStreetListResponse';
import { GetRemovedConstructiveElements } from './definitions/GetRemovedConstructiveElements';
import { GetRemovedConstructiveElementsResponse } from './definitions/GetRemovedConstructiveElementsResponse';
import { GetSmallConstructiveElementInformation } from './definitions/GetSmallConstructiveElementInformation';
import { GetSmallConstructiveElementInformationResponse } from './definitions/GetSmallConstructiveElementInformationResponse';
import { GetStreetList } from './definitions/GetStreetList';
import { GetStreetListResponse } from './definitions/GetStreetListResponse';
import { GettingAddressId } from './definitions/GettingAddressId';
import { GettingAddressIdResponse } from './definitions/GettingAddressIdResponse';
import { RefreshWsdl } from './definitions/RefreshWsdl';
import { RefreshWsdlResponse } from './definitions/RefreshWsdlResponse';
import { RegisterNewHouse } from './definitions/RegisterNewHouse';
import { RegisterNewHouseResponse } from './definitions/RegisterNewHouseResponse';
import { RemoveConstructiveElement } from './definitions/RemoveConstructiveElement';
import { RemoveConstructiveElementResponse } from './definitions/RemoveConstructiveElementResponse';
import { RemoveConstructiveElementExtendedValue } from './definitions/RemoveConstructiveElementExtendedValue';
import { RemoveConstructiveElementExtendedValueResponse } from './definitions/RemoveConstructiveElementExtendedValueResponse';
import { RemoveFlatExtendedValue } from './definitions/RemoveFlatExtendedValue';
import { RemoveFlatExtendedValueResponse } from './definitions/RemoveFlatExtendedValueResponse';
import { RemoveHouseModerator } from './definitions/RemoveHouseModerator';
import { RemoveHouseModeratorResponse } from './definitions/RemoveHouseModeratorResponse';
import { RestoreConstructiveElement } from './definitions/RestoreConstructiveElement';
import { RestoreConstructiveElementResponse } from './definitions/RestoreConstructiveElementResponse';
import { RestoreConstructiveElementValueHistory } from './definitions/RestoreConstructiveElementValueHistory';
import { RestoreConstructiveElementValueHistoryResponse } from './definitions/RestoreConstructiveElementValueHistoryResponse';
import { RestoreFlatValueHistory } from './definitions/RestoreFlatValueHistory';
import { RestoreFlatValueHistoryResponse } from './definitions/RestoreFlatValueHistoryResponse';
import { RestoreHouseValueHistory } from './definitions/RestoreHouseValueHistory';
import { RestoreHouseValueHistoryResponse } from './definitions/RestoreHouseValueHistoryResponse';
import { SetRole } from './definitions/SetRole';
import { SetRoleResponse } from './definitions/SetRoleResponse';
import { SosediInvites } from './definitions/SosediInvites';
import { SosediInvitesResponse } from './definitions/SosediInvitesResponse';
import { SocialAddress } from './services/SocialAddress';

export interface Api2SocialAddressServiceClient extends SoapClient {
  SocialAddress: SocialAddress;
  AddConstructiveElementExtendedValueAsync(
    addConstructiveElementExtendedValue: AddConstructiveElementExtendedValue,
  ): Promise<
    [
      result: AddConstructiveElementExtendedValueResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  AddFlatExtendedValueAsync(
    addFlatExtendedValue: AddFlatExtendedValue,
  ): Promise<
    [
      result: AddFlatExtendedValueResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  AddHouseModeratorAsync(
    addHouseModerator: AddHouseModerator,
  ): Promise<
    [
      result: AddHouseModeratorResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  CreateConstructiveElementAsync(
    createConstructiveElement: CreateConstructiveElement,
  ): Promise<
    [
      result: CreateConstructiveElementResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  EditAdditionalHouseInformationAsync(
    editAdditionalHouseInformation: EditAdditionalHouseInformation,
  ): Promise<
    [
      result: EditAdditionalHouseInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  EditBaseHouseInformationAsync(
    editBaseHouseInformation: EditBaseHouseInformation,
  ): Promise<
    [
      result: EditBaseHouseInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  EditConstructiveElementInformationAsync(
    editConstructiveElementInformation: EditConstructiveElementInformation,
  ): Promise<
    [
      result: EditConstructiveElementInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  EditFlatInformationAsync(
    editFlatInformation: EditFlatInformation,
  ): Promise<
    [
      result: EditFlatInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  EditManagementCompanyInformationAsync(
    editManagementCompanyInformation: EditManagementCompanyInformation,
  ): Promise<
    [
      result: EditManagementCompanyInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  FindManagementCompanyAsync(
    findManagementCompany: FindManagementCompany,
  ): Promise<
    [
      result: FindManagementCompanyResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetAddressFullIdsAsync(
    getAddressFullIds: GetAddressFullIds,
  ): Promise<
    [
      result: GetAddressFullIdsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetAddressListAsync(
    getAddressList: GetAddressList,
  ): Promise<
    [
      result: GetAddressListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetAvatarStatusInHouseAsync(
    getAvatarStatusInHouse: GetAvatarStatusInHouse,
  ): Promise<
    [
      result: GetAvatarStatusInHouseResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCityListAsync(
    getCityList: GetCityList,
  ): Promise<
    [
      result: GetCityListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetConstructiveElementInformationAsync(
    getConstructiveElementInformation: GetConstructiveElementInformation,
  ): Promise<
    [
      result: GetConstructiveElementInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetConstructiveElementTypesAsync(
    getConstructiveElementTypes: GetConstructiveElementTypes,
  ): Promise<
    [
      result: GetConstructiveElementTypesResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetConstructiveElementValueHistoryAsync(
    getConstructiveElementValueHistory: GetConstructiveElementValueHistory,
  ): Promise<
    [
      result: GetConstructiveElementValueHistoryResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCountHouseAsync(
    getCountHouse: GetCountHouse,
  ): Promise<
    [
      result: GetCountHouseResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCountryListAsync(
    getCountryList: GetCountryList,
  ): Promise<
    [
      result: GetCountryListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetFlatInformationAsync(
    getFlatInformation: GetFlatInformation,
  ): Promise<
    [
      result: GetFlatInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetFlatPopulationAsync(
    getFlatPopulation: GetFlatPopulation,
  ): Promise<
    [
      result: GetFlatPopulationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetFlatValueHistoryAsync(
    getFlatValueHistory: GetFlatValueHistory,
  ): Promise<
    [
      result: GetFlatValueHistoryResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseAvatarByUrlAsync(
    getHouseAvatarByUrl: GetHouseAvatarByUrl,
  ): Promise<
    [
      result: GetHouseAvatarByUrlResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseAvatarIdByHouseIdAsync(
    getHouseAvatarIdByHouseId: GetHouseAvatarIdByHouseId,
  ): Promise<
    [
      result: GetHouseAvatarIdByHouseIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseIdByUrlAsync(
    getHouseIdByUrl: GetHouseIdByUrl,
  ): Promise<
    [
      result: GetHouseIdByUrlResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseInfoAsync(
    getHouseInfo: GetHouseInfo,
  ): Promise<
    [
      result: GetHouseInfoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseInformationAsync(
    getHouseInformation: GetHouseInformation,
  ): Promise<
    [
      result: GetHouseInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseListAsync(
    getHouseList: GetHouseList,
  ): Promise<
    [
      result: GetHouseListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseListByStreetNameAsync(
    getHouseListByStreetName: GetHouseListByStreetName,
  ): Promise<
    [
      result: GetHouseListByStreetNameResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseModeratorsAsync(
    getHouseModerators: GetHouseModerators,
  ): Promise<
    [
      result: GetHouseModeratorsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHousePopulationAsync(
    getHousePopulation: GetHousePopulation,
  ): Promise<
    [
      result: GetHousePopulationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseUrlByHouseIdAsync(
    getHouseUrlByHouseId: GetHouseUrlByHouseId,
  ): Promise<
    [
      result: GetHouseUrlByHouseIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetHouseValueHistoryAsync(
    getHouseValueHistory: GetHouseValueHistory,
  ): Promise<
    [
      result: GetHouseValueHistoryResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetManageCompanyListAsync(
    getManageCompanyList: GetManageCompanyList,
  ): Promise<
    [
      result: GetManageCompanyListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetManagementCompanyInformationAsync(
    getManagementCompanyInformation: GetManagementCompanyInformation,
  ): Promise<
    [
      result: GetManagementCompanyInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetObjectPropertyListAsync(
    getObjectPropertyList: GetObjectPropertyList,
  ): Promise<
    [
      result: GetObjectPropertyListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetRegionListAsync(
    getRegionList: GetRegionList,
  ): Promise<
    [
      result: GetRegionListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetRegisteredCityListAsync(
    getRegisteredCityList: GetRegisteredCityList,
  ): Promise<
    [
      result: GetRegisteredCityListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetRegisteredHouseListAsync(
    getRegisteredHouseList: GetRegisteredHouseList,
  ): Promise<
    [
      result: GetRegisteredHouseListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetRegisteredStreetListAsync(
    getRegisteredStreetList: GetRegisteredStreetList,
  ): Promise<
    [
      result: GetRegisteredStreetListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetRemovedConstructiveElementsAsync(
    getRemovedConstructiveElements: GetRemovedConstructiveElements,
  ): Promise<
    [
      result: GetRemovedConstructiveElementsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetSmallConstructiveElementInformationAsync(
    getSmallConstructiveElementInformation: GetSmallConstructiveElementInformation,
  ): Promise<
    [
      result: GetSmallConstructiveElementInformationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetStreetListAsync(
    getStreetList: GetStreetList,
  ): Promise<
    [
      result: GetStreetListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GettingAddressIdAsync(
    gettingAddressId: GettingAddressId,
  ): Promise<
    [
      result: GettingAddressIdResponse,
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
  RegisterNewHouseAsync(
    registerNewHouse: RegisterNewHouse,
  ): Promise<
    [
      result: RegisterNewHouseResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RemoveConstructiveElementAsync(
    removeConstructiveElement: RemoveConstructiveElement,
  ): Promise<
    [
      result: RemoveConstructiveElementResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RemoveConstructiveElementExtendedValueAsync(
    removeConstructiveElementExtendedValue: RemoveConstructiveElementExtendedValue,
  ): Promise<
    [
      result: RemoveConstructiveElementExtendedValueResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RemoveFlatExtendedValueAsync(
    removeFlatExtendedValue: RemoveFlatExtendedValue,
  ): Promise<
    [
      result: RemoveFlatExtendedValueResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RemoveHouseModeratorAsync(
    removeHouseModerator: RemoveHouseModerator,
  ): Promise<
    [
      result: RemoveHouseModeratorResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RestoreConstructiveElementAsync(
    restoreConstructiveElement: RestoreConstructiveElement,
  ): Promise<
    [
      result: RestoreConstructiveElementResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RestoreConstructiveElementValueHistoryAsync(
    restoreConstructiveElementValueHistory: RestoreConstructiveElementValueHistory,
  ): Promise<
    [
      result: RestoreConstructiveElementValueHistoryResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RestoreFlatValueHistoryAsync(
    restoreFlatValueHistory: RestoreFlatValueHistory,
  ): Promise<
    [
      result: RestoreFlatValueHistoryResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RestoreHouseValueHistoryAsync(
    restoreHouseValueHistory: RestoreHouseValueHistory,
  ): Promise<
    [
      result: RestoreHouseValueHistoryResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SetRoleAsync(
    setRole: SetRole,
  ): Promise<
    [
      result: SetRoleResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SosediInvitesAsync(
    sosediInvites: SosediInvites,
  ): Promise<
    [
      result: SosediInvitesResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
}

/** Create Api2SocialAddressServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<Api2SocialAddressServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
