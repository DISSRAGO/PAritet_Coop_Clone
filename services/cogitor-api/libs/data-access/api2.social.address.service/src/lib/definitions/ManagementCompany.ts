import { ParamList } from './ParamList';

/**
 * ManagementCompany
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface ManagementCompany {
  attributes: {
    Id: string;
    Name: string;
  };
  /** ParamList */
  ParamList?: ParamList;
}
