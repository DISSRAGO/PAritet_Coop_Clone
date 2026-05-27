export type Category  = {
	key: string;
	title: string;
	children?: Array<Category>;
}
