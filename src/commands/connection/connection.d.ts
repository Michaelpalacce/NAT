export interface Connection {
	name: string,
	url: string,
	port: string,
	username?: string,
	password?: string,
	domain?: string,
	refreshToken?: string;
}
