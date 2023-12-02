import { readFileSync } from "fs";
import { getNatConfig } from "./fs/locations.js";

export interface Config {
	repo: {
		url: string,
		username: string,
		password: string;
		cache: boolean;
	},
}

let config: Config;

/**
* Fetches the config from the config folder. It will cache the response
*/
export function getConfig(): Config {
	if (config) {
		return config;
	}
	const data = readFileSync(getNatConfig());

	return config = JSON.parse(data.toString());
}
