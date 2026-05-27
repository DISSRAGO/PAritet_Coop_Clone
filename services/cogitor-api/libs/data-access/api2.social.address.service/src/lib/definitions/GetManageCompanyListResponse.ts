import { Status } from './Status';
import { ManageCompanyList } from './ManageCompanyList';

/** GetManageCompanyListResponse */
export interface GetManageCompanyListResponse {
  /** Status */
  Status?: Status;
  /** ManageCompanyList */
  ManageCompanyList?: ManageCompanyList;
  /** s:string */
  TotalCount?: string;
}
