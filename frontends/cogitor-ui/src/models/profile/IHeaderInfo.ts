import {IUserPhoto} from "./UserPhoto";

export interface IHeaderInfo {
	id?: number;
	email?: string;
	login?: string;
	name?: string;
	photoImage?: IUserPhoto;
}
