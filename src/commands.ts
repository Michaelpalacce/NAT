import { join } from "path";
import { CliOptions } from "./arguments.js";
import { initCertificates, initDependencies, resetNatFolder } from "./nat/init.js";
import ensureDirClean from "./helpers/fs/ensureDirClean.js";
import vrotsc from "./btva/vrotsc.js";
import vropkg from "./btva/vropkg.js";
import { existsSync } from "fs";
import { getConnectionsDir } from "./helpers/fs/locations.js";
import { addConnection, getConnections, hasConnection } from "./nat/connection.js";
import { ArtifactData, fetchArtifactData } from "./helpers/maven/artifact.js";
import logger from "./logger/logger.js";
import push from "./nat/push.js";
import inquirer from "inquirer";
import vrotest from "./btva/vrotest.js";

/**
* This will initialize all the dependencies for NAT
*/
export async function initCmd(args: CliOptions) {
	logger.verbose("Initializing NAT");
	await resetNatFolder();
	await initDependencies(args);
	await initCertificates(args);

	if (!existsSync(getConnectionsDir())) {
		logger.warn("No connection folder found while initializing, prompting");
		await addConnection();
	}

	logger.verbose("Successfully initialized");
}

export async function vrotscCmd(args: CliOptions) {
	const cwd = process.cwd();
	const outFolder = join(cwd, args.outFolder);

	// Fetches artifact data, stores it in a lock file and returns it. Alternatively if the lock file exists, fetches it from there
	const artifactData: ArtifactData = await fetchArtifactData(cwd);

	if (args.files) {
		// Clears out the outDirectory
		ensureDirClean(outFolder);
	}

	// Runs vrotsc to transpile TS code
	await vrotsc(args, artifactData);
}

export async function vropkgCmd(args: CliOptions) {
	const cwd = process.cwd();

	// Fetches artifact data, stores it in a lock file and returns it. Alternatively if the lock file exists, fetches it from there
	const artifactData: ArtifactData = await fetchArtifactData(cwd);

	// Runs vropkg to create the .package file
	await vropkg(args, artifactData);
}

/**
* Packages the current working dir to a .package
* Will skip cleaning up the dir if --files is passed to support incremental updates
*/
export async function buildCmd(args: CliOptions) {
	logger.verbose("Building");

	const start = Date.now();

	await vrotscCmd(args);
	await vropkgCmd(args);

	logger.verbose(`Done Building: Took: ${(Date.now() - start) / 1000}s`);
}

export async function testCmd(args: CliOptions) {
	const cwd = process.cwd();

	const artifactData: ArtifactData = await fetchArtifactData(cwd);

	await vrotest(args, artifactData);
}

/**
* Adds a new connection. Will prompt the user if needed
*/
export async function addConnectionCmd(args: CliOptions) {
	logger.verbose("Adding a new connection");
	await addConnection();
	logger.verbose("Done adding a new connection");
}

export async function pushCmd(args: CliOptions) {
	logger.verbose("Pushing Code");

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
	logger.verbose("Done pushing Code");
}
