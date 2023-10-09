import { parse } from "ts-command-line-args";
import { getHomedir } from './helpers/fs/locations.js';
import { join } from "path";

export interface CliOptions {
	outFolder: string,
	keystoreLocation: string,

	help: boolean,

	watch: boolean,

	init: boolean,
	build: boolean,
	files: string,
	test: boolean,
	push: boolean,
	connection: string,
	addConnection: boolean;
	deleteConnection: boolean;

	btvaVersion: string,
	clean: boolean,
}

export const DEFAULT_OUT_FOLDER = 'NAT';
export const DEFAULT_BTVA_VERSION = '2.35.1';

/**
* Parses the process.argv arguments based on the options provided
*/
export function parseArguments() {
	return parse<CliOptions>(
		{
			outFolder: { type: String, defaultValue: DEFAULT_OUT_FOLDER, description: "Where to output the generated `.package` file as well as other build artifacts. Default: NAT" },
			keystoreLocation: { type: String, defaultValue: join(getHomedir(), ".m2", "keystore"), description: "Init: Holds the location to the keystore folder. Must contain a cert.pem and a private_key.pem. Default: ~/.m2/keystore" },

			help: { type: Boolean, defaultValue: false, alias: "h", description: "Displays Help" },

			watch: { type: Boolean, defaultValue: false, alias: "w", description: "Watches for changes after initial build" },

			init: { type: Boolean, defaultValue: false, description: "Initialize NAT dependencies, downloads vrotsc and vropkg from maven central" },
			build: { type: Boolean, defaultValue: false, alias: "b", description: "Prepares a package that can be pushed" },
			files: { type: String, defaultValue: '', alias: "f", description: "Which files to only build" },
			test: { type: Boolean, defaultValue: false, alias: "t", description: "Runs tests" },
			push: { type: Boolean, defaultValue: false, alias: "p", description: "WIP: Pushes the prepared package" },
			connection: { type: String, defaultValue: '', alias: "c", description: "Connection to use when pushing the package" },
			addConnection: { type: Boolean, defaultValue: false, description: "Adds a new Aria connection" },
			deleteConnection: { type: Boolean, defaultValue: false, description: "WIP: Deletes an existing Aria connection" },

			btvaVersion: { type: String, defaultValue: DEFAULT_BTVA_VERSION, description: "Specifies the btva version to use when initializing vropkg and vrotsc" },
			clean: { type: Boolean, defaultValue: false, description: "TEMPORARY: Runs `mvn clean package` once to ensure that the target folder exists, so we have dependencies + type definitions" }
		},
		{
			helpArg: 'help',
			headerContentSections: [
				{ header: 'NodeJS Aria Tools', content: 'A cli helper to save us all from mvn. Aimed ONLY at pushing typescript code to Orchestrator which is what is most commonly used for.' },
				{ header: 'Support', content: '.If it breaks, blame Stefan Genov' }
			],
			footerContentSections: [{ header: 'License', content: `Copyright: Beer` }],
		}
	);
}
