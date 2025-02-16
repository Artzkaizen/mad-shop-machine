export interface Price {
	id: number;
	netPrice: number;
	currency: string;
	vatRate: number;
}

export interface Product {
	id: number;
	documentId: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	productStatus: string;
}

export interface Item {
	id: number;
	quantity: number;
	product: Product | null;
	price: Price;
}

export interface Order {
	id: number;
	documentId: string;
	issue: boolean;
	orderStatus: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	items: Item[];
}

export interface Pagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface Meta {
	pagination: Pagination;
}

export interface OrderResponse {
	data: Order[];
	meta: Meta;
}
