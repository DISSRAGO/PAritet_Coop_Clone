import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap';
import { AgreeOferta } from './definitions/AgreeOferta';
import { AgreeOfertaResponse } from './definitions/AgreeOfertaResponse';
import { CalcAmountsForMarket } from './definitions/CalcAmountsForMarket';
import { CalcAmountsForMarketResponse } from './definitions/CalcAmountsForMarketResponse';
import { CancelOrderList } from './definitions/CancelOrderList';
import { CancelOrderListResponse } from './definitions/CancelOrderListResponse';
import { ChangeGoodEnabled } from './definitions/ChangeGoodEnabled';
import { ChangeGoodEnabledResponse } from './definitions/ChangeGoodEnabledResponse';
import { ChangeGoodHidden } from './definitions/ChangeGoodHidden';
import { ChangeGoodHiddenResponse } from './definitions/ChangeGoodHiddenResponse';
import { ChangeInvoiceState } from './definitions/ChangeInvoiceState';
import { ChangeInvoiceStateResponse } from './definitions/ChangeInvoiceStateResponse';
import { ChangeOrderPosition } from './definitions/ChangeOrderPosition';
import { ChangeOrderPositionResponse } from './definitions/ChangeOrderPositionResponse';
import { ChangeOrderState } from './definitions/ChangeOrderState';
import { ChangeOrderStateResponse } from './definitions/ChangeOrderStateResponse';
import { ChangeProductState } from './definitions/ChangeProductState';
import { ChangeProductStateResponse } from './definitions/ChangeProductStateResponse';
import { CheckPaymentTypeForTrade } from './definitions/CheckPaymentTypeForTrade';
import { CheckPaymentTypeForTradeResponse } from './definitions/CheckPaymentTypeForTradeResponse';
import { ConfirmOrderList } from './definitions/ConfirmOrderList';
import { ConfirmOrderListResponse } from './definitions/ConfirmOrderListResponse';
import { CreateOrderList } from './definitions/CreateOrderList';
import { CreateOrderListResponse } from './definitions/CreateOrderListResponse';
import { FindOrCreateDistributionContract } from './definitions/FindOrCreateDistributionContract';
import { FindOrCreateDistributionContractResponse } from './definitions/FindOrCreateDistributionContractResponse';
import { GetAvailablePaymentType } from './definitions/GetAvailablePaymentType';
import { GetAvailablePaymentTypeResponse } from './definitions/GetAvailablePaymentTypeResponse';
import { GetAvailableStatesByContractId } from './definitions/GetAvailableStatesByContractId';
import { GetAvailableStatesByContractIdResponse } from './definitions/GetAvailableStatesByContractIdResponse';
import { GetCashBoxReport } from './definitions/GetCashBoxReport';
import { GetCashBoxReportResponse } from './definitions/GetCashBoxReportResponse';
import { GetCashFromCashier } from './definitions/GetCashFromCashier';
import { GetCashFromCashierResponse } from './definitions/GetCashFromCashierResponse';
import { GetCashInCashBoxList } from './definitions/GetCashInCashBoxList';
import { GetCashInCashBoxListResponse } from './definitions/GetCashInCashBoxListResponse';
import { GetCategoryHierarchy } from './definitions/GetCategoryHierarchy';
import { GetCategoryHierarchyResponse } from './definitions/GetCategoryHierarchyResponse';
import { GetCategoryList } from './definitions/GetCategoryList';
import { GetCategoryListResponse } from './definitions/GetCategoryListResponse';
import { GetCategoryParentList } from './definitions/GetCategoryParentList';
import { GetCategoryParentListResponse } from './definitions/GetCategoryParentListResponse';
import { GetCounters } from './definitions/GetCounters';
import { GetCountersResponse } from './definitions/GetCountersResponse';
import { GetDistributionContractById } from './definitions/GetDistributionContractById';
import { GetDistributionContractByIdResponse } from './definitions/GetDistributionContractByIdResponse';
import { GetDistributionContractList } from './definitions/GetDistributionContractList';
import { GetDistributionContractListResponse } from './definitions/GetDistributionContractListResponse';
import { GetDistributorListForUser } from './definitions/GetDistributorListForUser';
import { GetDistributorListForUserResponse } from './definitions/GetDistributorListForUserResponse';
import { GetDistributorTarifList } from './definitions/GetDistributorTarifList';
import { GetDistributorTarifListResponse } from './definitions/GetDistributorTarifListResponse';
import { GetDistributorTarifListByIdList } from './definitions/GetDistributorTarifListByIdList';
import { GetDistributorTarifListByIdListResponse } from './definitions/GetDistributorTarifListByIdListResponse';
import { GetGoods } from './definitions/GetGoods';
import { GetGoodsResponse } from './definitions/GetGoodsResponse';
import { GetGoodsList } from './definitions/GetGoodsList';
import { GetGoodsListResponse } from './definitions/GetGoodsListResponse';
import { GetInvoiceList } from './definitions/GetInvoiceList';
import { GetInvoiceListResponse } from './definitions/GetInvoiceListResponse';
import { GetInvoiceListInternal } from './definitions/GetInvoiceListInternal';
import { GetInvoiceListInternalResponse } from './definitions/GetInvoiceListInternalResponse';
import { GetMainCategoryList } from './definitions/GetMainCategoryList';
import { GetMainCategoryListResponse } from './definitions/GetMainCategoryListResponse';
import { GetNewestGoodsList } from './definitions/GetNewestGoodsList';
import { GetNewestGoodsListResponse } from './definitions/GetNewestGoodsListResponse';
import { GetNotificationSettingList } from './definitions/GetNotificationSettingList';
import { GetNotificationSettingListResponse } from './definitions/GetNotificationSettingListResponse';
import { GetOrder } from './definitions/GetOrder';
import { GetOrderResponse } from './definitions/GetOrderResponse';
import { GetOrderItemList } from './definitions/GetOrderItemList';
import { GetOrderItemListResponse } from './definitions/GetOrderItemListResponse';
import { GetOrderList } from './definitions/GetOrderList';
import { GetOrderListResponse } from './definitions/GetOrderListResponse';
import { GetParamsForNewDistributionContract } from './definitions/GetParamsForNewDistributionContract';
import { GetParamsForNewDistributionContractResponse } from './definitions/GetParamsForNewDistributionContractResponse';
import { GetPersonalList } from './definitions/GetPersonalList';
import { GetPersonalListResponse } from './definitions/GetPersonalListResponse';
import { GetProducerListForUser } from './definitions/GetProducerListForUser';
import { GetProducerListForUserResponse } from './definitions/GetProducerListForUserResponse';
import { GetRole } from './definitions/GetRole';
import { GetRoleResponse } from './definitions/GetRoleResponse';
import { GetRoleList } from './definitions/GetRoleList';
import { GetRoleListResponse } from './definitions/GetRoleListResponse';
import { GetTransferHistoryList } from './definitions/GetTransferHistoryList';
import { GetTransferHistoryListResponse } from './definitions/GetTransferHistoryListResponse';
import { GetTvt } from './definitions/GetTvt';
import { GetTvtResponse } from './definitions/GetTvtResponse';
import { GetTvtList } from './definitions/GetTvtList';
import { GetTvtListResponse } from './definitions/GetTvtListResponse';
import { GetUnitList } from './definitions/GetUnitList';
import { GetUnitListResponse } from './definitions/GetUnitListResponse';
import { GetWareHouseAccessList } from './definitions/GetWareHouseAccessList';
import { GetWareHouseAccessListResponse } from './definitions/GetWareHouseAccessListResponse';
import { GetWareHouseById } from './definitions/GetWareHouseById';
import { GetWareHouseByIdResponse } from './definitions/GetWareHouseByIdResponse';
import { GetWareHouseList } from './definitions/GetWareHouseList';
import { GetWareHouseListResponse } from './definitions/GetWareHouseListResponse';
import { GetWareHouseRests } from './definitions/GetWareHouseRests';
import { GetWareHouseRestsResponse } from './definitions/GetWareHouseRestsResponse';
import { PostGoods } from './definitions/PostGoods';
import { PostGoodsResponse } from './definitions/PostGoodsResponse';
import { RefreshWsdl } from './definitions/RefreshWsdl';
import { RefreshWsdlResponse } from './definitions/RefreshWsdlResponse';
import { Register } from './definitions/Register';
import { RegisterResponse } from './definitions/RegisterResponse';
import { RemoveWareHouseAccess } from './definitions/RemoveWareHouseAccess';
import { RemoveWareHouseAccessResponse } from './definitions/RemoveWareHouseAccessResponse';
import { SalesReport } from './definitions/SalesReport';
import { SalesReportResponse } from './definitions/SalesReportResponse';
import { SaveDistributionContract } from './definitions/SaveDistributionContract';
import { SaveDistributionContractResponse } from './definitions/SaveDistributionContractResponse';
import { SaveDistributorTarifListByDistributor } from './definitions/SaveDistributorTarifListByDistributor';
import { SaveDistributorTarifListByDistributorResponse } from './definitions/SaveDistributorTarifListByDistributorResponse';
import { SaveGood } from './definitions/SaveGood';
import { SaveGoodResponse } from './definitions/SaveGoodResponse';
import { SaveTvt } from './definitions/SaveTvt';
import { SaveTvtResponse } from './definitions/SaveTvtResponse';
import { SaveWareHouse } from './definitions/SaveWareHouse';
import { SaveWareHouseResponse } from './definitions/SaveWareHouseResponse';
import { SaveWareHouseAccess } from './definitions/SaveWareHouseAccess';
import { SaveWareHouseAccessResponse } from './definitions/SaveWareHouseAccessResponse';
import { SetCashierLimit } from './definitions/SetCashierLimit';
import { SetCashierLimitResponse } from './definitions/SetCashierLimitResponse';
import { SetContractStatus } from './definitions/SetContractStatus';
import { SetContractStatusResponse } from './definitions/SetContractStatusResponse';
import { SetNotificationSettingList } from './definitions/SetNotificationSettingList';
import { SetNotificationSettingListResponse } from './definitions/SetNotificationSettingListResponse';
import { SetPaymentType } from './definitions/SetPaymentType';
import { SetPaymentTypeResponse } from './definitions/SetPaymentTypeResponse';
import { SetPinCode } from './definitions/SetPinCode';
import { SetPinCodeResponse } from './definitions/SetPinCodeResponse';
import { ShowProductLog } from './definitions/ShowProductLog';
import { ShowProductLogResponse } from './definitions/ShowProductLogResponse';
import { TransferGoods } from './definitions/TransferGoods';
import { TransferGoodsResponse } from './definitions/TransferGoodsResponse';
import { UpdateRolesForUser } from './definitions/UpdateRolesForUser';
import { UpdateRolesForUserResponse } from './definitions/UpdateRolesForUserResponse';
import { WriteOffGoods } from './definitions/WriteOffGoods';
import { WriteOffGoodsResponse } from './definitions/WriteOffGoodsResponse';
import { MarketService } from './services/MarketService';

export interface ApiExtMarketServiceClient extends SoapClient {
  MarketService: MarketService;
  AgreeOfertaAsync(
    agreeOferta: AgreeOferta,
  ): Promise<
    [
      result: AgreeOfertaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  CalcAmountsForMarketAsync(
    calcAmountsForMarket: CalcAmountsForMarket,
  ): Promise<
    [
      result: CalcAmountsForMarketResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  CancelOrderListAsync(
    cancelOrderList: CancelOrderList,
  ): Promise<
    [
      result: CancelOrderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ChangeGoodEnabledAsync(
    changeGoodEnabled: ChangeGoodEnabled,
  ): Promise<
    [
      result: ChangeGoodEnabledResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ChangeGoodHiddenAsync(
    changeGoodHidden: ChangeGoodHidden,
  ): Promise<
    [
      result: ChangeGoodHiddenResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ChangeInvoiceStateAsync(
    changeInvoiceState: ChangeInvoiceState,
  ): Promise<
    [
      result: ChangeInvoiceStateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ChangeOrderPositionAsync(
    changeOrderPosition: ChangeOrderPosition,
  ): Promise<
    [
      result: ChangeOrderPositionResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ChangeOrderStateAsync(
    changeOrderState: ChangeOrderState,
  ): Promise<
    [
      result: ChangeOrderStateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ChangeProductStateAsync(
    changeProductState: ChangeProductState,
  ): Promise<
    [
      result: ChangeProductStateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  CheckPaymentTypeForTradeAsync(
    checkPaymentTypeForTrade: CheckPaymentTypeForTrade,
  ): Promise<
    [
      result: CheckPaymentTypeForTradeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ConfirmOrderListAsync(
    confirmOrderList: ConfirmOrderList,
  ): Promise<
    [
      result: ConfirmOrderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  CreateOrderListAsync(
    createOrderList: CreateOrderList,
  ): Promise<
    [
      result: CreateOrderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  FindOrCreateDistributionContractAsync(
    findOrCreateDistributionContract: FindOrCreateDistributionContract,
  ): Promise<
    [
      result: FindOrCreateDistributionContractResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetAvailablePaymentTypeAsync(
    getAvailablePaymentType: GetAvailablePaymentType,
  ): Promise<
    [
      result: GetAvailablePaymentTypeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetAvailableStatesByContractIdAsync(
    getAvailableStatesByContractId: GetAvailableStatesByContractId,
  ): Promise<
    [
      result: GetAvailableStatesByContractIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCashBoxReportAsync(
    getCashBoxReport: GetCashBoxReport,
  ): Promise<
    [
      result: GetCashBoxReportResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCashFromCashierAsync(
    getCashFromCashier: GetCashFromCashier,
  ): Promise<
    [
      result: GetCashFromCashierResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCashInCashBoxListAsync(
    getCashInCashBoxList: GetCashInCashBoxList,
  ): Promise<
    [
      result: GetCashInCashBoxListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCategoryHierarchyAsync(
    getCategoryHierarchy: GetCategoryHierarchy,
  ): Promise<
    [
      result: GetCategoryHierarchyResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCategoryListAsync(
    getCategoryList: GetCategoryList,
  ): Promise<
    [
      result: GetCategoryListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCategoryParentListAsync(
    getCategoryParentList: GetCategoryParentList,
  ): Promise<
    [
      result: GetCategoryParentListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetCountersAsync(
    getCounters: GetCounters,
  ): Promise<
    [
      result: GetCountersResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetDistributionContractByIdAsync(
    getDistributionContractById: GetDistributionContractById,
  ): Promise<
    [
      result: GetDistributionContractByIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetDistributionContractListAsync(
    getDistributionContractList: GetDistributionContractList,
  ): Promise<
    [
      result: GetDistributionContractListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetDistributorListForUserAsync(
    getDistributorListForUser: GetDistributorListForUser,
  ): Promise<
    [
      result: GetDistributorListForUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetDistributorTarifListAsync(
    getDistributorTarifList: GetDistributorTarifList,
  ): Promise<
    [
      result: GetDistributorTarifListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetDistributorTarifListByIdListAsync(
    getDistributorTarifListByIdList: GetDistributorTarifListByIdList,
  ): Promise<
    [
      result: GetDistributorTarifListByIdListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetGoodsAsync(
    getGoods: GetGoods,
  ): Promise<
    [
      result: GetGoodsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetGoodsListAsync(
    getGoodsList: GetGoodsList,
  ): Promise<
    [
      result: GetGoodsListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetInvoiceListAsync(
    getInvoiceList: GetInvoiceList,
  ): Promise<
    [
      result: GetInvoiceListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetInvoiceListInternalAsync(
    getInvoiceListInternal: GetInvoiceListInternal,
  ): Promise<
    [
      result: GetInvoiceListInternalResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetMainCategoryListAsync(
    getMainCategoryList: GetMainCategoryList,
  ): Promise<
    [
      result: GetMainCategoryListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetNewestGoodsListAsync(
    getNewestGoodsList: GetNewestGoodsList,
  ): Promise<
    [
      result: GetNewestGoodsListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetNotificationSettingListAsync(
    getNotificationSettingList: GetNotificationSettingList,
  ): Promise<
    [
      result: GetNotificationSettingListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetOrderAsync(
    getOrder: GetOrder,
  ): Promise<
    [
      result: GetOrderResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetOrderItemListAsync(
    getOrderItemList: GetOrderItemList,
  ): Promise<
    [
      result: GetOrderItemListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetOrderListAsync(
    getOrderList: GetOrderList,
  ): Promise<
    [
      result: GetOrderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetParamsForNewDistributionContractAsync(
    getParamsForNewDistributionContract: GetParamsForNewDistributionContract,
  ): Promise<
    [
      result: GetParamsForNewDistributionContractResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetPersonalListAsync(
    getPersonalList: GetPersonalList,
  ): Promise<
    [
      result: GetPersonalListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetProducerListForUserAsync(
    getProducerListForUser: GetProducerListForUser,
  ): Promise<
    [
      result: GetProducerListForUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetRoleAsync(
    getRole: GetRole,
  ): Promise<
    [
      result: GetRoleResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetRoleListAsync(
    getRoleList: GetRoleList,
  ): Promise<
    [
      result: GetRoleListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetTransferHistoryListAsync(
    getTransferHistoryList: GetTransferHistoryList,
  ): Promise<
    [
      result: GetTransferHistoryListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetTvtAsync(
    getTvt: GetTvt,
  ): Promise<
    [result: GetTvtResponse, rawResponse: any, soapHeader: any, rawRequest: any]
  >;
  GetTvtListAsync(
    getTvtList: GetTvtList,
  ): Promise<
    [
      result: GetTvtListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetUnitListAsync(
    getUnitList: GetUnitList,
  ): Promise<
    [
      result: GetUnitListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetWareHouseAccessListAsync(
    getWareHouseAccessList: GetWareHouseAccessList,
  ): Promise<
    [
      result: GetWareHouseAccessListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetWareHouseByIdAsync(
    getWareHouseById: GetWareHouseById,
  ): Promise<
    [
      result: GetWareHouseByIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetWareHouseListAsync(
    getWareHouseList: GetWareHouseList,
  ): Promise<
    [
      result: GetWareHouseListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  GetWareHouseRestsAsync(
    getWareHouseRests: GetWareHouseRests,
  ): Promise<
    [
      result: GetWareHouseRestsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  PostGoodsAsync(
    postGoods: PostGoods,
  ): Promise<
    [
      result: PostGoodsResponse,
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
  RegisterAsync(
    register: Register,
  ): Promise<
    [
      result: RegisterResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RemoveWareHouseAccessAsync(
    removeWareHouseAccess: RemoveWareHouseAccess,
  ): Promise<
    [
      result: RemoveWareHouseAccessResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SalesReportAsync(
    salesReport: SalesReport,
  ): Promise<
    [
      result: SalesReportResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SaveDistributionContractAsync(
    saveDistributionContract: SaveDistributionContract,
  ): Promise<
    [
      result: SaveDistributionContractResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SaveDistributorTarifListByDistributorAsync(
    saveDistributorTarifListByDistributor: SaveDistributorTarifListByDistributor,
  ): Promise<
    [
      result: SaveDistributorTarifListByDistributorResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SaveGoodAsync(
    saveGood: SaveGood,
  ): Promise<
    [
      result: SaveGoodResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SaveTvtAsync(
    saveTvt: SaveTvt,
  ): Promise<
    [
      result: SaveTvtResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SaveWareHouseAsync(
    saveWareHouse: SaveWareHouse,
  ): Promise<
    [
      result: SaveWareHouseResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SaveWareHouseAccessAsync(
    saveWareHouseAccess: SaveWareHouseAccess,
  ): Promise<
    [
      result: SaveWareHouseAccessResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SetCashierLimitAsync(
    setCashierLimit: SetCashierLimit,
  ): Promise<
    [
      result: SetCashierLimitResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SetContractStatusAsync(
    setContractStatus: SetContractStatus,
  ): Promise<
    [
      result: SetContractStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SetNotificationSettingListAsync(
    setNotificationSettingList: SetNotificationSettingList,
  ): Promise<
    [
      result: SetNotificationSettingListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SetPaymentTypeAsync(
    setPaymentType: SetPaymentType,
  ): Promise<
    [
      result: SetPaymentTypeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  SetPinCodeAsync(
    setPinCode: SetPinCode,
  ): Promise<
    [
      result: SetPinCodeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  ShowProductLogAsync(
    showProductLog: ShowProductLog,
  ): Promise<
    [
      result: ShowProductLogResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  TransferGoodsAsync(
    transferGoods: TransferGoods,
  ): Promise<
    [
      result: TransferGoodsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  UpdateRolesForUserAsync(
    updateRolesForUser: UpdateRolesForUser,
  ): Promise<
    [
      result: UpdateRolesForUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  WriteOffGoodsAsync(
    writeOffGoods: WriteOffGoods,
  ): Promise<
    [
      result: WriteOffGoodsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
}

/** Create ApiExtMarketServiceClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<ApiExtMarketServiceClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
