import { Osm } from './Osm';
import { Base } from './Base';
import { Additional } from './Additional';
import { HouseParts } from './HouseParts';
import { ExternalSource } from './ExternalSource';
import { Flats } from './Flats';
import { Avatar } from './Avatar';

/**
 * House
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface House {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  AddressName?: string;
  /** OSM */
  OSM?: Osm;
  /** s:string */
  ProxyObjectId?: string;
  /** Base */
  Base?: Base;
  /** Additional */
  Additional?: Additional;
  /** BaseFromInfoShina */
  BaseFromInfoShina?: Base;
  /** AdditionalFromInfoShina */
  AdditionalFromInfoShina?: Additional;
  /** HouseParts */
  HouseParts?: HouseParts;
  /** ExternalSource */
  ExternalSource?: ExternalSource;
  /** s:string */
  CanEdit?: string;
  /** s:string */
  CanVerify?: string;
  /** s:string */
  CanAddElements?: string;
  /** Flats */
  Flats?: Flats;
  /** s:string */
  StreetId?: string;
  /** s:string */
  CityId?: string;
  /** s:string */
  RegionId?: string;
  /** s:string */
  CountryId?: string;
  /** s:string */
  StreetName?: string;
  /** s:string */
  HouseName?: string;
  /** AvatarInfo */
  AvatarInfo?: Avatar;
}
