import { parse } from "ts-command-line-args";
import { getHomedir } from './helpers/fs/locations.js';
import { join } from "path";

export interface CliOptions {
	outFolder: string,
	keystoreLocation: string,

	help: boolean,
	version: boolean,
	verbosity: string,

	watch: boolean,
	watchMs: number,

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
export const DEFAULT_WATCH_MS = 5000;
export const DEFAULT_CONNECTION_NAME = "Aria";

/**
* Parses the process.argv arguments based on the options provided
*/
export function parseArguments(): CliOptions {
	return parse<CliOptions>(
		{
			// META
			help: { type: Boolean, defaultValue: false, alias: "h", description: "Displays Help" },
			version: { type: Boolean, defaultValue: false, alias: "v", description: "Current version of the tool" },
			verbosity: { type: String, defaultValue: "info", description: "Logging verbosity: error, warn, info, http, verbose, debug, silly" },

			// INIT
			init: { type: Boolean, defaultValue: false, description: "Initialize NAT dependencies, downloads vrotsc and vropkg from maven central" },
			keystoreLocation: { type: String, defaultValue: join(getHomedir(), ".m2", "keystore"), description: "Init: Holds the location to the keystore folder. Must contain a cert.pem and a private_key.pem. Default: ~/.m2/keystore" },
			btvaVersion: { type: String, defaultValue: DEFAULT_BTVA_VERSION, description: "Specifies the btva version to use when initializing vropkg and vrotsc" },

			// Build + Push
			clean: { type: Boolean, defaultValue: false, description: "Cleans up the NAT folder" },
			watch: { type: Boolean, defaultValue: false, alias: "w", description: "Watches for changes after initial build. This will significantly speed up the process." },
			watchMs: { type: Number, defaultValue: DEFAULT_WATCH_MS, description: "How long should we debounce the recompillation." },
			build: { type: Boolean, defaultValue: false, alias: "b", description: "Transpiles the code from TS to JS." },
			test: { type: Boolean, defaultValue: false, alias: "t", description: "Runs tests. You must have compiled the code beforehand." },
			push: { type: Boolean, defaultValue: false, alias: "p", description: "BETA: Prepares and pushes the package" },

			// Build Lifecycle Options
			outFolder: { type: String, defaultValue: DEFAULT_OUT_FOLDER, description: "Where to output the generated `.package` file as well as other build artifacts. Default: NAT" },
			connection: { type: String, defaultValue: '', alias: "c", description: "Connection to use when pushing the package" },
			files: { type: String, defaultValue: '', description: "Which files to only build" },

			// Connection specific
			addConnection: { type: Boolean, defaultValue: false, description: "Adds a new Aria connection" },
			deleteConnection: { type: Boolean, defaultValue: false, description: "WIP: Deletes an existing Aria connection" },
		},
		{
			helpArg: 'help',
			headerContentSections: [
				{ header: 'NodeJS Aria Tools', content: 'A cli helper to save us all from mvn.\nThe Goal of this tool is to provide you the ability to work with typescript code.' },
				{ header: 'Usage', content: 'Example: `nat -b -t -p` will build, test and push the code.' },
				{ header: 'Watch Mode', content: 'Running: `nat --watch` will run nat in a watch mode.\n Upon file changes it will recompile only that specific file, speeding up the process. In another terminal, after the compilation is done you can choose to `-t` test it or `-p` push it.' },
			],
			footerContentSections: [
				{ header: 'Support', content: 'If it breaks it wasn\'t Stefan\'s fault' },
				{ header: 'License', content: `Copyright: Beer` }
			],
		}
	);
}
