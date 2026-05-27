import { AgreeOferta } from '../definitions/AgreeOferta';
import { AgreeOfertaResponse } from '../definitions/AgreeOfertaResponse';
import { CalcAmountsForMarket } from '../definitions/CalcAmountsForMarket';
import { CalcAmountsForMarketResponse } from '../definitions/CalcAmountsForMarketResponse';
import { CancelOrderList } from '../definitions/CancelOrderList';
import { CancelOrderListResponse } from '../definitions/CancelOrderListResponse';
import { ChangeGoodEnabled } from '../definitions/ChangeGoodEnabled';
import { ChangeGoodEnabledResponse } from '../definitions/ChangeGoodEnabledResponse';
import { ChangeGoodHidden } from '../definitions/ChangeGoodHidden';
import { ChangeGoodHiddenResponse } from '../definitions/ChangeGoodHiddenResponse';
import { ChangeInvoiceState } from '../definitions/ChangeInvoiceState';
import { ChangeInvoiceStateResponse } from '../definitions/ChangeInvoiceStateResponse';
import { ChangeOrderPosition } from '../definitions/ChangeOrderPosition';
import { ChangeOrderPositionResponse } from '../definitions/ChangeOrderPositionResponse';
import { ChangeOrderState } from '../definitions/ChangeOrderState';
import { ChangeOrderStateResponse } from '../definitions/ChangeOrderStateResponse';
import { ChangeProductState } from '../definitions/ChangeProductState';
import { ChangeProductStateResponse } from '../definitions/ChangeProductStateResponse';
import { CheckPaymentTypeForTrade } from '../definitions/CheckPaymentTypeForTrade';
import { CheckPaymentTypeForTradeResponse } from '../definitions/CheckPaymentTypeForTradeResponse';
import { ConfirmOrderList } from '../definitions/ConfirmOrderList';
import { ConfirmOrderListResponse } from '../definitions/ConfirmOrderListResponse';
import { CreateOrderList } from '../definitions/CreateOrderList';
import { CreateOrderListResponse } from '../definitions/CreateOrderListResponse';
import { FindOrCreateDistributionContract } from '../definitions/FindOrCreateDistributionContract';
import { FindOrCreateDistributionContractResponse } from '../definitions/FindOrCreateDistributionContractResponse';
import { GetAvailablePaymentType } from '../definitions/GetAvailablePaymentType';
import { GetAvailablePaymentTypeResponse } from '../definitions/GetAvailablePaymentTypeResponse';
import { GetAvailableStatesByContractId } from '../definitions/GetAvailableStatesByContractId';
import { GetAvailableStatesByContractIdResponse } from '../definitions/GetAvailableStatesByContractIdResponse';
import { GetCashBoxReport } from '../definitions/GetCashBoxReport';
import { GetCashBoxReportResponse } from '../definitions/GetCashBoxReportResponse';
import { GetCashFromCashier } from '../definitions/GetCashFromCashier';
import { GetCashFromCashierResponse } from '../definitions/GetCashFromCashierResponse';
import { GetCashInCashBoxList } from '../definitions/GetCashInCashBoxList';
import { GetCashInCashBoxListResponse } from '../definitions/GetCashInCashBoxListResponse';
import { GetCategoryHierarchy } from '../definitions/GetCategoryHierarchy';
import { GetCategoryHierarchyResponse } from '../definitions/GetCategoryHierarchyResponse';
import { GetCategoryList } from '../definitions/GetCategoryList';
import { GetCategoryListResponse } from '../definitions/GetCategoryListResponse';
import { GetCategoryParentList } from '../definitions/GetCategoryParentList';
import { GetCategoryParentListResponse } from '../definitions/GetCategoryParentListResponse';
import { GetCounters } from '../definitions/GetCounters';
import { GetCountersResponse } from '../definitions/GetCountersResponse';
import { GetDistributionContractById } from '../definitions/GetDistributionContractById';
import { GetDistributionContractByIdResponse } from '../definitions/GetDistributionContractByIdResponse';
import { GetDistributionContractList } from '../definitions/GetDistributionContractList';
import { GetDistributionContractListResponse } from '../definitions/GetDistributionContractListResponse';
import { GetDistributorListForUser } from '../definitions/GetDistributorListForUser';
import { GetDistributorListForUserResponse } from '../definitions/GetDistributorListForUserResponse';
import { GetDistributorTarifList } from '../definitions/GetDistributorTarifList';
import { GetDistributorTarifListResponse } from '../definitions/GetDistributorTarifListResponse';
import { GetDistributorTarifListByIdList } from '../definitions/GetDistributorTarifListByIdList';
import { GetDistributorTarifListByIdListResponse } from '../definitions/GetDistributorTarifListByIdListResponse';
import { GetGoods } from '../definitions/GetGoods';
import { GetGoodsResponse } from '../definitions/GetGoodsResponse';
import { GetGoodsList } from '../definitions/GetGoodsList';
import { GetGoodsListResponse } from '../definitions/GetGoodsListResponse';
import { GetInvoiceList } from '../definitions/GetInvoiceList';
import { GetInvoiceListResponse } from '../definitions/GetInvoiceListResponse';
import { GetInvoiceListInternal } from '../definitions/GetInvoiceListInternal';
import { GetInvoiceListInternalResponse } from '../definitions/GetInvoiceListInternalResponse';
import { GetMainCategoryList } from '../definitions/GetMainCategoryList';
import { GetMainCategoryListResponse } from '../definitions/GetMainCategoryListResponse';
import { GetNewestGoodsList } from '../definitions/GetNewestGoodsList';
import { GetNewestGoodsListResponse } from '../definitions/GetNewestGoodsListResponse';
import { GetNotificationSettingList } from '../definitions/GetNotificationSettingList';
import { GetNotificationSettingListResponse } from '../definitions/GetNotificationSettingListResponse';
import { GetOrder } from '../definitions/GetOrder';
import { GetOrderResponse } from '../definitions/GetOrderResponse';
import { GetOrderItemList } from '../definitions/GetOrderItemList';
import { GetOrderItemListResponse } from '../definitions/GetOrderItemListResponse';
import { GetOrderList } from '../definitions/GetOrderList';
import { GetOrderListResponse } from '../definitions/GetOrderListResponse';
import { GetParamsForNewDistributionContract } from '../definitions/GetParamsForNewDistributionContract';
import { GetParamsForNewDistributionContractResponse } from '../definitions/GetParamsForNewDistributionContractResponse';
import { GetPersonalList } from '../definitions/GetPersonalList';
import { GetPersonalListResponse } from '../definitions/GetPersonalListResponse';
import { GetProducerListForUser } from '../definitions/GetProducerListForUser';
import { GetProducerListForUserResponse } from '../definitions/GetProducerListForUserResponse';
import { GetRole } from '../definitions/GetRole';
import { GetRoleResponse } from '../definitions/GetRoleResponse';
import { GetRoleList } from '../definitions/GetRoleList';
import { GetRoleListResponse } from '../definitions/GetRoleListResponse';
import { GetTransferHistoryList } from '../definitions/GetTransferHistoryList';
import { GetTransferHistoryListResponse } from '../definitions/GetTransferHistoryListResponse';
import { GetTvt } from '../definitions/GetTvt';
import { GetTvtResponse } from '../definitions/GetTvtResponse';
import { GetTvtList } from '../definitions/GetTvtList';
import { GetTvtListResponse } from '../definitions/GetTvtListResponse';
import { GetUnitList } from '../definitions/GetUnitList';
import { GetUnitListResponse } from '../definitions/GetUnitListResponse';
import { GetWareHouseAccessList } from '../definitions/GetWareHouseAccessList';
import { GetWareHouseAccessListResponse } from '../definitions/GetWareHouseAccessListResponse';
import { GetWareHouseById } from '../definitions/GetWareHouseById';
import { GetWareHouseByIdResponse } from '../definitions/GetWareHouseByIdResponse';
import { GetWareHouseList } from '../definitions/GetWareHouseList';
import { GetWareHouseListResponse } from '../definitions/GetWareHouseListResponse';
import { GetWareHouseRests } from '../definitions/GetWareHouseRests';
import { GetWareHouseRestsResponse } from '../definitions/GetWareHouseRestsResponse';
import { PostGoods } from '../definitions/PostGoods';
import { PostGoodsResponse } from '../definitions/PostGoodsResponse';
import { RefreshWsdl } from '../definitions/RefreshWsdl';
import { RefreshWsdlResponse } from '../definitions/RefreshWsdlResponse';
import { Register } from '../definitions/Register';
import { RegisterResponse } from '../definitions/RegisterResponse';
import { RemoveWareHouseAccess } from '../definitions/RemoveWareHouseAccess';
import { RemoveWareHouseAccessResponse } from '../definitions/RemoveWareHouseAccessResponse';
import { SalesReport } from '../definitions/SalesReport';
import { SalesReportResponse } from '../definitions/SalesReportResponse';
import { SaveDistributionContract } from '../definitions/SaveDistributionContract';
import { SaveDistributionContractResponse } from '../definitions/SaveDistributionContractResponse';
import { SaveDistributorTarifListByDistributor } from '../definitions/SaveDistributorTarifListByDistributor';
import { SaveDistributorTarifListByDistributorResponse } from '../definitions/SaveDistributorTarifListByDistributorResponse';
import { SaveGood } from '../definitions/SaveGood';
import { SaveGoodResponse } from '../definitions/SaveGoodResponse';
import { SaveTvt } from '../definitions/SaveTvt';
import { SaveTvtResponse } from '../definitions/SaveTvtResponse';
import { SaveWareHouse } from '../definitions/SaveWareHouse';
import { SaveWareHouseResponse } from '../definitions/SaveWareHouseResponse';
import { SaveWareHouseAccess } from '../definitions/SaveWareHouseAccess';
import { SaveWareHouseAccessResponse } from '../definitions/SaveWareHouseAccessResponse';
import { SetCashierLimit } from '../definitions/SetCashierLimit';
import { SetCashierLimitResponse } from '../definitions/SetCashierLimitResponse';
import { SetContractStatus } from '../definitions/SetContractStatus';
import { SetContractStatusResponse } from '../definitions/SetContractStatusResponse';
import { SetNotificationSettingList } from '../definitions/SetNotificationSettingList';
import { SetNotificationSettingListResponse } from '../definitions/SetNotificationSettingListResponse';
import { SetPaymentType } from '../definitions/SetPaymentType';
import { SetPaymentTypeResponse } from '../definitions/SetPaymentTypeResponse';
import { SetPinCode } from '../definitions/SetPinCode';
import { SetPinCodeResponse } from '../definitions/SetPinCodeResponse';
import { ShowProductLog } from '../definitions/ShowProductLog';
import { ShowProductLogResponse } from '../definitions/ShowProductLogResponse';
import { TransferGoods } from '../definitions/TransferGoods';
import { TransferGoodsResponse } from '../definitions/TransferGoodsResponse';
import { UpdateRolesForUser } from '../definitions/UpdateRolesForUser';
import { UpdateRolesForUserResponse } from '../definitions/UpdateRolesForUserResponse';
import { WriteOffGoods } from '../definitions/WriteOffGoods';
import { WriteOffGoodsResponse } from '../definitions/WriteOffGoodsResponse';

export interface MarketServiceSoap {
  AgreeOferta(
    agreeOferta: AgreeOferta,
    callback: (
      err: any,
      result: AgreeOfertaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  CalcAmountsForMarket(
    calcAmountsForMarket: CalcAmountsForMarket,
    callback: (
      err: any,
      result: CalcAmountsForMarketResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  CancelOrderList(
    cancelOrderList: CancelOrderList,
    callback: (
      err: any,
      result: CancelOrderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ChangeGoodEnabled(
    changeGoodEnabled: ChangeGoodEnabled,
    callback: (
      err: any,
      result: ChangeGoodEnabledResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ChangeGoodHidden(
    changeGoodHidden: ChangeGoodHidden,
    callback: (
      err: any,
      result: ChangeGoodHiddenResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ChangeInvoiceState(
    changeInvoiceState: ChangeInvoiceState,
    callback: (
      err: any,
      result: ChangeInvoiceStateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ChangeOrderPosition(
    changeOrderPosition: ChangeOrderPosition,
    callback: (
      err: any,
      result: ChangeOrderPositionResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ChangeOrderState(
    changeOrderState: ChangeOrderState,
    callback: (
      err: any,
      result: ChangeOrderStateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ChangeProductState(
    changeProductState: ChangeProductState,
    callback: (
      err: any,
      result: ChangeProductStateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  CheckPaymentTypeForTrade(
    checkPaymentTypeForTrade: CheckPaymentTypeForTrade,
    callback: (
      err: any,
      result: CheckPaymentTypeForTradeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ConfirmOrderList(
    confirmOrderList: ConfirmOrderList,
    callback: (
      err: any,
      result: ConfirmOrderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  CreateOrderList(
    createOrderList: CreateOrderList,
    callback: (
      err: any,
      result: CreateOrderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  FindOrCreateDistributionContract(
    findOrCreateDistributionContract: FindOrCreateDistributionContract,
    callback: (
      err: any,
      result: FindOrCreateDistributionContractResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetAvailablePaymentType(
    getAvailablePaymentType: GetAvailablePaymentType,
    callback: (
      err: any,
      result: GetAvailablePaymentTypeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetAvailableStatesByContractId(
    getAvailableStatesByContractId: GetAvailableStatesByContractId,
    callback: (
      err: any,
      result: GetAvailableStatesByContractIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCashBoxReport(
    getCashBoxReport: GetCashBoxReport,
    callback: (
      err: any,
      result: GetCashBoxReportResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCashFromCashier(
    getCashFromCashier: GetCashFromCashier,
    callback: (
      err: any,
      result: GetCashFromCashierResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCashInCashBoxList(
    getCashInCashBoxList: GetCashInCashBoxList,
    callback: (
      err: any,
      result: GetCashInCashBoxListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCategoryHierarchy(
    getCategoryHierarchy: GetCategoryHierarchy,
    callback: (
      err: any,
      result: GetCategoryHierarchyResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCategoryList(
    getCategoryList: GetCategoryList,
    callback: (
      err: any,
      result: GetCategoryListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCategoryParentList(
    getCategoryParentList: GetCategoryParentList,
    callback: (
      err: any,
      result: GetCategoryParentListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetCounters(
    getCounters: GetCounters,
    callback: (
      err: any,
      result: GetCountersResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetDistributionContractById(
    getDistributionContractById: GetDistributionContractById,
    callback: (
      err: any,
      result: GetDistributionContractByIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetDistributionContractList(
    getDistributionContractList: GetDistributionContractList,
    callback: (
      err: any,
      result: GetDistributionContractListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetDistributorListForUser(
    getDistributorListForUser: GetDistributorListForUser,
    callback: (
      err: any,
      result: GetDistributorListForUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetDistributorTarifList(
    getDistributorTarifList: GetDistributorTarifList,
    callback: (
      err: any,
      result: GetDistributorTarifListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetDistributorTarifListByIdList(
    getDistributorTarifListByIdList: GetDistributorTarifListByIdList,
    callback: (
      err: any,
      result: GetDistributorTarifListByIdListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetGoods(
    getGoods: GetGoods,
    callback: (
      err: any,
      result: GetGoodsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetGoodsList(
    getGoodsList: GetGoodsList,
    callback: (
      err: any,
      result: GetGoodsListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetInvoiceList(
    getInvoiceList: GetInvoiceList,
    callback: (
      err: any,
      result: GetInvoiceListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetInvoiceListInternal(
    getInvoiceListInternal: GetInvoiceListInternal,
    callback: (
      err: any,
      result: GetInvoiceListInternalResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetMainCategoryList(
    getMainCategoryList: GetMainCategoryList,
    callback: (
      err: any,
      result: GetMainCategoryListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetNewestGoodsList(
    getNewestGoodsList: GetNewestGoodsList,
    callback: (
      err: any,
      result: GetNewestGoodsListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetNotificationSettingList(
    getNotificationSettingList: GetNotificationSettingList,
    callback: (
      err: any,
      result: GetNotificationSettingListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetOrder(
    getOrder: GetOrder,
    callback: (
      err: any,
      result: GetOrderResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetOrderItemList(
    getOrderItemList: GetOrderItemList,
    callback: (
      err: any,
      result: GetOrderItemListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetOrderList(
    getOrderList: GetOrderList,
    callback: (
      err: any,
      result: GetOrderListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetParamsForNewDistributionContract(
    getParamsForNewDistributionContract: GetParamsForNewDistributionContract,
    callback: (
      err: any,
      result: GetParamsForNewDistributionContractResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetPersonalList(
    getPersonalList: GetPersonalList,
    callback: (
      err: any,
      result: GetPersonalListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetProducerListForUser(
    getProducerListForUser: GetProducerListForUser,
    callback: (
      err: any,
      result: GetProducerListForUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetRole(
    getRole: GetRole,
    callback: (
      err: any,
      result: GetRoleResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetRoleList(
    getRoleList: GetRoleList,
    callback: (
      err: any,
      result: GetRoleListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetTransferHistoryList(
    getTransferHistoryList: GetTransferHistoryList,
    callback: (
      err: any,
      result: GetTransferHistoryListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetTvt(
    getTvt: GetTvt,
    callback: (
      err: any,
      result: GetTvtResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetTvtList(
    getTvtList: GetTvtList,
    callback: (
      err: any,
      result: GetTvtListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetUnitList(
    getUnitList: GetUnitList,
    callback: (
      err: any,
      result: GetUnitListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetWareHouseAccessList(
    getWareHouseAccessList: GetWareHouseAccessList,
    callback: (
      err: any,
      result: GetWareHouseAccessListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetWareHouseById(
    getWareHouseById: GetWareHouseById,
    callback: (
      err: any,
      result: GetWareHouseByIdResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetWareHouseList(
    getWareHouseList: GetWareHouseList,
    callback: (
      err: any,
      result: GetWareHouseListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  GetWareHouseRests(
    getWareHouseRests: GetWareHouseRests,
    callback: (
      err: any,
      result: GetWareHouseRestsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  PostGoods(
    postGoods: PostGoods,
    callback: (
      err: any,
      result: PostGoodsResponse,
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
  Register(
    register: Register,
    callback: (
      err: any,
      result: RegisterResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  RemoveWareHouseAccess(
    removeWareHouseAccess: RemoveWareHouseAccess,
    callback: (
      err: any,
      result: RemoveWareHouseAccessResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SalesReport(
    salesReport: SalesReport,
    callback: (
      err: any,
      result: SalesReportResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SaveDistributionContract(
    saveDistributionContract: SaveDistributionContract,
    callback: (
      err: any,
      result: SaveDistributionContractResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SaveDistributorTarifListByDistributor(
    saveDistributorTarifListByDistributor: SaveDistributorTarifListByDistributor,
    callback: (
      err: any,
      result: SaveDistributorTarifListByDistributorResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SaveGood(
    saveGood: SaveGood,
    callback: (
      err: any,
      result: SaveGoodResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SaveTvt(
    saveTvt: SaveTvt,
    callback: (
      err: any,
      result: SaveTvtResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SaveWareHouse(
    saveWareHouse: SaveWareHouse,
    callback: (
      err: any,
      result: SaveWareHouseResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SaveWareHouseAccess(
    saveWareHouseAccess: SaveWareHouseAccess,
    callback: (
      err: any,
      result: SaveWareHouseAccessResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SetCashierLimit(
    setCashierLimit: SetCashierLimit,
    callback: (
      err: any,
      result: SetCashierLimitResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SetContractStatus(
    setContractStatus: SetContractStatus,
    callback: (
      err: any,
      result: SetContractStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SetNotificationSettingList(
    setNotificationSettingList: SetNotificationSettingList,
    callback: (
      err: any,
      result: SetNotificationSettingListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SetPaymentType(
    setPaymentType: SetPaymentType,
    callback: (
      err: any,
      result: SetPaymentTypeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  SetPinCode(
    setPinCode: SetPinCode,
    callback: (
      err: any,
      result: SetPinCodeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  ShowProductLog(
    showProductLog: ShowProductLog,
    callback: (
      err: any,
      result: ShowProductLogResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  TransferGoods(
    transferGoods: TransferGoods,
    callback: (
      err: any,
      result: TransferGoodsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  UpdateRolesForUser(
    updateRolesForUser: UpdateRolesForUser,
    callback: (
      err: any,
      result: UpdateRolesForUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
  WriteOffGoods(
    writeOffGoods: WriteOffGoods,
    callback: (
      err: any,
      result: WriteOffGoodsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;
}
