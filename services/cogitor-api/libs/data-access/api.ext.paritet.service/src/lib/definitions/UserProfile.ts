import { LivingAddress } from './LivingAddress';
import { RegistrationAddress } from './RegistrationAddress';
import { BirthPlace } from './BirthPlace';
import { PassportPage1Image } from './PassportPage1Image';

/**
 * UserProfile
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface UserProfile {
  /** s:string */
  Id?: string;
  /** s:string */
  Login?: string;
  /** s:boolean */
  IsTrusted?: string;
  /** s:string */
  TypeCode?: string;
  /** s:string */
  Name?: string;
  /** LivingAddress */
  LivingAddress?: LivingAddress;
  /** s:string */
  EMail?: string;
  /** s:string */
  Phone?: string;
  /** s:string */
  SMSPhone?: string;
  /** s:string */
  Snils?: string;
  /** RegistrationAddress */
  RegistrationAddress?: RegistrationAddress;
  /** BirthPlace */
  BirthPlace?: BirthPlace;
  /** s:string */
  BirthDate?: string;
  /** s:string */
  PassportGivenBy?: string;
  /** s:string */
  PassportGivenDate?: string;
  /** s:string */
  PassportNumber?: string;
  /** s:string */
  PassportSeries?: string;
  /** s:string */
  Sex?: string;
  /** s:string */
  PassportUnitCode?: string;
  /** PassportPage1Image */
  PassportPage1Image?: PassportPage1Image;
  /** PassportPage2Image */
  PassportPage2Image?: PassportPage1Image;
  /** UserPhotoDto */
  PhotoImage?: PassportPage1Image;
  /** StatementImage */
  StatementImage?: PassportPage1Image;
}
