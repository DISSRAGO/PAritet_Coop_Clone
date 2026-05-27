import { Phones } from './Phones';
import { Emails } from './Emails';

/** SosediInvites */
export interface SosediInvites {
  /** Phones */
  Phones?: Phones;
  /** Emails */
  Emails?: Emails;
  /** s:string */
  SmsText?: string;
  /** s:string */
  EmailText?: string;
  /** s:string */
  EmailTheme?: string;
  /** s:string */
  HouseId?: string;
  /** s:string */
  FlatId?: string;
  /** s:string */
  FlatNumber?: string;
}
