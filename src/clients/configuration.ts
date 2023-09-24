import { Connection } from "../nat/connection.js";

export default class Configuration {
	constructor(private connection: Connection) {
	}

	getUsername() {
		return this.connection.username;
	}
	getPassword() {
		return this.connection.password;
	}
	getDomain() {
		return this.connection.domain;
	}
	getUrl() {
		return this.connection.url;
	}
	getPort() {
		return this.connection.port;
	}
	getRefreshToken() {
		return this.connection.refreshToken;
	}
}
