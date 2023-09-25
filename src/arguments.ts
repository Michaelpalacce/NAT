import { parse } from "ts-command-line-args";
import { getHomedir } from './helpers/fs/locations.js';
import { join } from "path";

export interface CliOptions {
	outFolder: string,
	help: boolean,
	keystoreLocation: string,

	init: boolean,
	build: boolean,
	push: boolean,
	connection: string,
	addConnection: boolean;
	deleteConnection: boolean;

	btvaVersion: string,
	clean: boolean,
}

export const DEFAULT_OUT_FOLDER = "NAT";
export const DEFAULT_BTVA_VERSION = '2.35.0';

/**
* Parses the process.argv arguments based on the options provided
*/
export function parseArguments() {
	return parse<CliOptions>(
		{
			outFolder: { type: String, defaultValue: DEFAULT_OUT_FOLDER, description: "Where to output the generated `.package` file as well as other build artifacts. Default: NAT" },
			keystoreLocation: { type: String, defaultValue: join(getHomedir(), ".m2", "keystore"), description: "Init: Holds the location to the keystore folder. Must contain a cert.pem and a private_key.pem. Default: ~/.m2/keystore" },

			help: { type: Boolean, defaultValue: false, alias: "h", description: "Displays Help" },

			init: { type: Boolean, defaultValue: false, description: "Initialize NAT dependencies, downloads vrotsc and vropkg from maven central" },
			build: { type: Boolean, defaultValue: false, alias: "b", description: "Prepares a package that can be pushed" },
			push: { type: Boolean, defaultValue: false, alias: "p", description: "WIP: Pushes the prepared package" },
			connection: { type: String, defaultValue: '', alias: "c", description: "Connection to use when pushing the package" },
			addConnection: { type: Boolean, defaultValue: false, description: "Adds a new Aria connection" },
			deleteConnection: { type: Boolean, defaultValue: false, description: "WIP: Deletes an existing Aria connection" },

			btvaVersion: { type: String, defaultValue: DEFAULT_BTVA_VERSION, description: "TEMPORARY: Specifies the btva version we should use when it's needed" },
			clean: { type: Boolean, defaultValue: false, description: "TEMPORARY: Runs `mvn clean package` once to ensure that the target folder exists, so we have dependencies + type definitions" }
		},
		{
			helpArg: 'help',
			headerContentSections: [{ header: 'NodeJS Aria Tools', content: 'If it breaks, blame Stefan Genov' }],
			footerContentSections: [{ header: 'License', content: `Copyright: Beer` }],
		}
	);
}
