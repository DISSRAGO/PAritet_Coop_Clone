import {IAccountOperation} from "./IAccountOperation";

export interface IOperationHistory {
	operationList?: Array<IAccountOperation>;
	balanceBegin?: string;
	balanceEnd?: string;
	totalDebit?: string;
	totalCredit?: string;
}
