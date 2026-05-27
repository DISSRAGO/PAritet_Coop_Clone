export enum FetchStatus {
	IDLE,
	LOADING,
	SUCCESS,
	FAIL,
}

export type Response<T> = {
	status: FetchStatus;
	error?: string;
	data: T | undefined;
};
