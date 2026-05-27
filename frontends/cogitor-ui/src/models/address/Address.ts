import {Country} from "./Country";
import {Region} from "./Region";
import {City} from "./City";
import {Street} from "./Street";
import {House} from "./House";
import {Flat} from "./Flat";

export interface Address {
	id: number;
	country: Country;
	region: Region;
	city: City;
	street: Street;
	house: House;
	flat: Flat;
}
