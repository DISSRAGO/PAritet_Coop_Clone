import { ParamList } from './ParamList';
import { ControlList } from './ControlList';
import { ChildrenList } from './ChildrenList';

/**
 * Result
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Result {
  /** s:string */
  MethodData?: string;
  /** s:string */
  Template?: string;
  /** s:string */
  TemplateStructure?: string;
  /** ParamList */
  ParamList?: ParamList;
  /** ControlList */
  ControlList?: ControlList;
  /** ChildrenList */
  ChildrenList?: ChildrenList;
}
