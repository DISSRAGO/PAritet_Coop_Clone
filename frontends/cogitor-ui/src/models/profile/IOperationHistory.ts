import {IAccountOperation} from "./IAccountOperation";

export interface IOperationHistory {
	operationList?: Array<IAccountOperation>;
	balanceBegin?: number;
	balanceEnd?: number;
	totalDebit?: number;
	totalCredit?: number;
}
