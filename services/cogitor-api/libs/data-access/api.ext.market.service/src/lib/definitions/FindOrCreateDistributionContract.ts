import { PropertyList } from './PropertyList';

/** FindOrCreateDistributionContract */
export interface FindOrCreateDistributionContract {
  /** s:string */
  ProducerId?: string;
  /** s:string */
  DistributorId?: string;
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
  /** s:boolean */
  CreateIfNotExists?: string;
  /** s:string */
  TypeList?: string;
  /** s:string */
  Description?: string;
}
