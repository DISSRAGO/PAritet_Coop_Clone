import { ParamList } from './ParamList';
import { AttrList } from './AttrList';
import { ControlList } from './ControlList';

/**
 * Control
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Control {
  /** ParamList */
  ParamList?: ParamList;
  /** AttrList */
  AttrList?: AttrList;
  /** ChildrenList */
  ChildrenList?: ControlList;
}
