import {IUserProfile} from "./IUserProfile";
import {Address} from "../address/Address";

export interface IUser {
	Status: string;
	UserProfile: IUserProfile;
	address: Address;
}
