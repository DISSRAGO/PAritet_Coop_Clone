import { FormInputList } from './FormInputList';
import { ControlList } from './ControlList';
import { ChildrenList } from './ChildrenList';

/**
 * Container
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Container {
  /** s:string */
  MethodData?: string;
  /** s:string */
  Template?: string;
  /** s:string */
  TemplateStructure?: string;
  /** ParamList */
  ParamList?: FormInputList;
  /** ControlList */
  ControlList?: ControlList;
  /** ChildrenList */
  ChildrenList?: ChildrenList;
}
