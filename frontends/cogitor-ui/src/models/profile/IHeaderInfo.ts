import {IUserPhoto} from "./UserPhoto";

export interface IHeaderInfo {
	id?: number;
	email?: string;
	login?: string;
	name?: string;
	photoImage?: IUserPhoto;
	// Stage 3 PR 4: subject_id (UUID) — канонический владелец выше login.
	// Бэк (/user/header_info) возвращает пустую строку, если personal subject
	// ещё не создан, — в этом случае SOAP-адаптер работает по старому (Login).
	subjectId?: string;
}
