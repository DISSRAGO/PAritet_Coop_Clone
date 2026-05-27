import { FormInputList } from './FormInputList';
import { AttrList } from './AttrList';
import { ControlList } from './ControlList';

/**
 * Control
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Control {
  attributes: {
    Id: string;
    ServerId: string;
    ClientId: string;
    Name: string;
    Description: string;
    Type: string;
    Value: string;
  };
  /** ParamList */
  ParamList?: FormInputList;
  /** AttrList */
  AttrList?: AttrList;
  /** ChildrenList */
  ChildrenList?: ControlList;
}
