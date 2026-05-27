import { ExtendedName } from './ExtendedName';
import { ExtendedValue } from './ExtendedValue';
import { ExtendedDesc } from './ExtendedDesc';
import { ExtendedVerify } from './ExtendedVerify';

/** EditConstructiveElementInformation */
export interface EditConstructiveElementInformation {
  /** s:string */
  ElementId?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  NameDesc?: string;
  /** s:string */
  Deterioration?: string;
  /** s:string */
  DeteriorationDesc?: string;
  /** s:string */
  LastRepairYear?: string;
  /** s:string */
  LastRepairYearDesc?: string;
  /** s:string */
  NextRepairYear?: string;
  /** s:string */
  NextRepairYearDesc?: string;
  /** s:string */
  Cost?: string;
  /** s:string */
  CostDesc?: string;
  /** s:string */
  Description?: string;
  /** s:string */
  DescriptionDesc?: string;
  /** s:string */
  TypeRepair?: string;
  /** s:string */
  TypeRepairDesc?: string;
  /** s:string */
  MunicipalMoney?: string;
  /** s:string */
  MunicipalMoneyDesc?: string;
  /** s:string */
  ViewDate?: string;
  /** s:string */
  ViewDateDesc?: string;
  /** s:string */
  NameVerify?: string;
  /** s:string */
  DeteriorationVerify?: string;
  /** s:string */
  LastRepairYearVerify?: string;
  /** s:string */
  NextRepairYearVerify?: string;
  /** s:string */
  CostVerify?: string;
  /** s:string */
  DescriptionVerify?: string;
  /** s:string */
  TypeRepairVerify?: string;
  /** s:string */
  MunicipalMoneyVerify?: string;
  /** s:string */
  ViewDateVerify?: string;
  /** ExtendedName */
  ExtendedName?: ExtendedName;
  /** ExtendedValue */
  ExtendedValue?: ExtendedValue;
  /** ExtendedDesc */
  ExtendedDesc?: ExtendedDesc;
  /** ExtendedVerify */
  ExtendedVerify?: ExtendedVerify;
}
