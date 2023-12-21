import { CliOptions } from "./arguments.js";
import { initConfiguration, initCertificates, initDependencies, resetNatFolder } from "./commands/init/index.js";
import ensureDirClean from "./helpers/fs/ensureDirClean.js";
import vrotsc from "./btva/vrotsc.js";
import vropkg from "./btva/vropkg.js";
import { existsSync, readFileSync } from "fs";
import { getConnectionsDir } from "./helpers/fs/locations.js";
import { addConnection, getConnections, hasConnection } from "./commands/connection/index.js";
import { Artifact, fetchProjectArtifactData } from "./helpers/maven/artifact.js";
import logger from "./logger/logger.js";
import push from "./commands/push/index.js";
import inquirer from "inquirer";
import vrotest from "./btva/vrotest.js";
import watch from "./commands/watch/index.js";
import { fetchDependencies } from "./commands/dependencies/index.js";
import { join, dirname } from "path";

import { fileURLToPath } from 'url';
import { rmdir } from "fs/promises";

/**
* Display the version to the user
*/
export async function versionCmd(args: CliOptions) {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const packageJsonLocation = join(__dirname, "../package.json");

	const packageJson = JSON.parse(
		readFileSync(packageJsonLocation).toString()
	);

	console.log(`Version: ${packageJson.version}`);
}

/**
* This will initialize all the dependencies for NAT
*/
export async function initCmd(args: CliOptions) {
	logger.verbose("Initializing NAT");

	await resetNatFolder();
	await initConfiguration(args);
	await initDependencies(args);
	await initCertificates(args);

	if (!existsSync(getConnectionsDir())) {
		logger.warn("No connection folder found while initializing, prompting");
		await addConnection();
	}

	logger.verbose("Successfully initialized");
}

/**
* Cleans the outFolder
*/
export async function cleanCmd(args: CliOptions) {
	const { outFolder } = args;
	logger.verbose(`Cleaning: ${outFolder}`);

	ensureDirClean(outFolder);

	logger.verbose(`Done cleaning: ${outFolder}`);
}

/**
* Fetches project dependencies.
* Will delete the node_modules folder and then fetch all the dependencies from the artifact.
* This will download both `.package` files and `.tgz`files.
* - `.package` - puts them in the NAT out dir.
* - `.tgz` - extracts them and puts them in the node_modules folder
*/
export async function dependenciesCmd(args: CliOptions) {
	logger.verbose("Dependencies");
	const start = Date.now();

	if (existsSync(join(process.cwd(), "node_modules")))
		await rmdir(join(process.cwd(), "node_modules"), { recursive: true });

	const artifactData: Artifact = await fetchProjectArtifactData(process.cwd());

	await fetchDependencies(args, artifactData);

	logger.verbose(`Done setting up dependencies: Took: ${(Date.now() - start) / 1000}s`);
}

/**
* Compiles the project with vrotsc. TS -> JS
* Will skip cleaning up the dir if --files is passed to support incremental updates
*/
export async function buildCmd(args: CliOptions) {
	logger.verbose("Building");
	const start = Date.now();

	await vrotscCmd(args);

	logger.verbose(`Done Building: Took: ${(Date.now() - start) / 1000}s`);
}

/**
* Runs vrotest. This will prepare a testbed and run the tests there
*/
export async function testCmd(args: CliOptions) {
	logger.verbose("Running tests");
	const start = Date.now();

	await vrotest(args, await fetchProjectArtifactData(process.cwd()));

	logger.verbose(`Finished with tests: Took: ${(Date.now() - start) / 1000}s`);
}

/**
* Adds a new connection. Will prompt the user if needed
*/
export async function addConnectionCmd(args: CliOptions) {
	logger.verbose("Adding a new connection");

	await addConnection();

	logger.verbose("Done adding a new connection");
}

/**
* Packages the code and pushes it
*/
export async function pushCmd(args: CliOptions) {
	logger.verbose("Pushing Code");
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
	logger.verbose(`Done pushing Code: Took: ${(Date.now() - start) / 1000}s`);
}

/**
* Starts a new watch on the `src` folder. In case of a change it will run vrotsc with a filter.
*/
export async function watchCmd(args: CliOptions) {
	logger.verbose(`Starting a watch on 'src' folder. Waiting for changes`);

	watch(args);
}

//////////////////////////////// PRIVATE ///////////////////////////////////////

/**
* Runs vrotsc that compiles the TS code to JS
* Fetches artifact data, stores it in a lock file and returns it. Alternatively if the lock file exists, fetches it from there
*/
async function vrotscCmd(args: CliOptions) {
	const artifactData: Artifact = await fetchProjectArtifactData(process.cwd());

	// Runs vrotsc to transpile TS code
	await vrotsc(args, artifactData);
}

/**
* Runs vropkg to create the .package file
*/
async function vropkgCmd(args: CliOptions) {
	const cwd = process.cwd();

	const artifactData: Artifact = await fetchProjectArtifactData(cwd);

	await vropkg(args, artifactData);
}
