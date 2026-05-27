import { AvatarFile } from './AvatarFile';
import { AbonentCreate } from './AbonentCreate';
import { ParamList1 } from './ParamList1';
import { TagList } from './TagList';
import { VirtualInfo } from './VirtualInfo';

/**
 * Avatar
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Avatar {
  /** s:string */
  TypeName?: string;
  /** s:string */
  Id?: string;
  /** AvatarFile */
  AvatarFile?: AvatarFile;
  /** AbonentCreate */
  AbonentCreate?: AbonentCreate;
  /** ParamList */
  ParamList?: ParamList1;
  /** s:string */
  DateCreate?: string;
  /** s:string */
  DateEdit?: string;
  /** s:string */
  Removed?: string;
  /** s:string */
  ClassName?: string;
  /** TagList */
  TagList?: TagList;
  /** s:string */
  AbonentAddressId?: string;
  /** VirtualInfo */
  VirtualInfo?: VirtualInfo;
}
