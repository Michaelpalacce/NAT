import { CliOptions } from "./arguments.js";
import { initCertificates, initDependencies, resetNatFolder } from "./commands/init/index.js";
import ensureDirClean from "./helpers/fs/ensureDirClean.js";
import vrotsc from "./btva/vrotsc.js";
import vropkg from "./btva/vropkg.js";
import { existsSync } from "fs";
import { getConnectionsDir } from "./helpers/fs/locations.js";
import { addConnection, getConnections, hasConnection } from "./commands/connection/index.js";
import { ArtifactData, fetchArtifactData } from "./helpers/maven/artifact.js";
import logger from "./logger/logger.js";
import push from "./commands/push/index.js";
import inquirer from "inquirer";
import vrotest from "./btva/vrotest.js";
import watch from "./commands/watch/index.js";
import { readFile } from "fs/promises";
import { join } from "path";

import version from "../package.json";

export async function versionCmd(args: CliOptions) {
	console.log(version);
}

/**
* This will initialize all the dependencies for NAT
*/
export async function initCmd(args: CliOptions) {
	logger.info("Initializing NAT");

	await resetNatFolder();
	await initDependencies(args);
	await initCertificates(args);

	if (!existsSync(getConnectionsDir())) {
		logger.warn("No connection folder found while initializing, prompting");
		await addConnection();
	}

	logger.info("Successfully initialized");
}

/**
* Cleans the outFolder
*/
export async function cleanCmd(args: CliOptions) {
	const { outFolder } = args;
	logger.info(`Cleaning: ${outFolder}`);

	ensureDirClean(outFolder);

	logger.info(`Done cleaning: ${outFolder}`);
}


/**
* Compiles the project with vrotsc. TS -> JS
* Will skip cleaning up the dir if --files is passed to support incremental updates
*/
export async function buildCmd(args: CliOptions) {
	logger.info("Building");
	const start = Date.now();

	await vrotscCmd(args);

	logger.info(`Done Building: Took: ${(Date.now() - start) / 1000}s`);
}

/**
* Runs vrotest. This will prepare a testbed and run the tests there
*/
export async function testCmd(args: CliOptions) {
	logger.info("Running tests");
	const start = Date.now();

	await vrotest(args, await fetchArtifactData(process.cwd()));

	logger.info(`Finished with tests: Took: ${(Date.now() - start) / 1000}s`);
}

/**
* Adds a new connection. Will prompt the user if needed
*/
export async function addConnectionCmd(args: CliOptions) {
	logger.info("Adding a new connection");

	await addConnection();

	logger.info("Done adding a new connection");
}

/**
* Packages the code and pushes it
*/
export async function pushCmd(args: CliOptions) {
	logger.info("Pushing Code");
	const start = Date.now();

	await vropkgCmd(args);

	if (!args.connection || !hasConnection(args.connection)) {
		const connections = await getConnections();

		if (connections.length === 0)
			throw new Error("Trying to push to Aria Orhcestrator, but no connections have been added. Run `nat --addConnection` first");

		logger.warn("No connection specified, or specified connection does not exists, prompting.");
		const answers = await inquirer.prompt([
			{
				name: "connection",
				type: "list",
				message: "Connection To Use: ",
				choices: connections,
				default: connections[0]
			}
		]);

		args.connection = answers.connection;
	}

	push(args);
	logger.info(`Done pushing Code: Took: ${(Date.now() - start) / 1000}s`);
}

/**
* Starts a new watch on the `src` folder. In case of a change it will run vrotsc with a filter.
*/
export async function watchCmd(args: CliOptions) {
	logger.info(`Starting a watch on 'src' folder. Waiting for changes`);

	watch(args);
}

//////////////////////////////// PRIVATE ///////////////////////////////////////

/**
* Runs vrotsc that compiles the TS code to JS, will clean up the outFolder if files are not given
* Fetches artifact data, stores it in a lock file and returns it. Alternatively if the lock file exists, fetches it from there
*/
async function vrotscCmd(args: CliOptions) {
	const artifactData: ArtifactData = await fetchArtifactData(process.cwd());

	if (!args.files) {
		await cleanCmd(args);
	}

	// Runs vrotsc to transpile TS code
	await vrotsc(args, artifactData);
}

/**
* Runs vropkg to create the .package file
*/
async function vropkgCmd(args: CliOptions) {
	const cwd = process.cwd();

	const artifactData: ArtifactData = await fetchArtifactData(cwd);

	await vropkg(args, artifactData);
}
