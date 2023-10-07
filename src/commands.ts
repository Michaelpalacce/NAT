import { join } from "path";
import { CliOptions } from "./arguments.js";
import { initCertificates, initDependencies, resetNatFolder } from "./nat/init.js";
import ensureDirClean from "./helpers/fs/ensureDirClean.js";
import vrotsc from "./btva/vrotsc.js";
import vropkg from "./btva/vropkg.js";
import { existsSync } from "fs";
import { getConnectionsDir } from "./helpers/fs/locations.js";
import { addConnection } from "./nat/connection.js";
import { ArtifactData, fetchArtifactData } from "./helpers/maven/artifact.js";
import logger from "./logger/logger.js";

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
* Packages the current working dir to a .package
*/
export async function buildCmd(args: CliOptions) {
	logger.info("Building");
	const cwd = process.cwd();
	const outFolder = join(cwd, args.outFolder);

	const start = Date.now();
	// Fetches artifact data, stores it in a lock file and returns it. Alternatively if the lock file exists, fetches it from there
	const artifactData: ArtifactData = await fetchArtifactData(cwd);
	// Clears out the outDirectory
	ensureDirClean(outFolder);
	// Runs vrotsc to transpile TS code
	await vrotsc(args, artifactData);
	// Runs vropkg to create the .package file
	await vropkg(args, artifactData);
	logger.info("Done building");
	logger.info(`Elapsed time generating package: ${(Date.now() - start) / 1000}s`);
}

/**
* Adds a new connection. Will prompt the user if needed
*/
export async function addConnectionCmd(args: CliOptions) {
	logger.info("Adding a new connection");
	await addConnection();
	logger.info("Done adding a new connection");
}

export async function pushCmd(args: CliOptions) {
}
