import { PropertyList } from './PropertyList';
import { ExcludeList } from './ExcludeList';

/** GetAbonent */
export interface GetAbonent {
  /** PropertyList */
  PropertyList?: PropertyList;
  /** ExcludeList */
  ExcludeList?: ExcludeList;
  /** s:boolean */
  Secure?: string;
}
