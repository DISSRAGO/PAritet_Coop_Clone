import {IUserPhoto} from "./UserPhoto";
import {Address} from "../address/Address";

export interface IUserProfile {
	id?: number;

	login?: string;

	isTrusted?: string;

	typeCode?: string;

	name?: string;

	email?: string;
	phone?: string;
	birthDate?: string;
	sex?: string;

	livingAddress?: Address;

	photoImage?: IUserPhoto;
}
