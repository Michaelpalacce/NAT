import { join } from "path";
import { CliOptions } from "./arguments.js";
import { initCertificates, initDependencies, resetNatFolder } from "./nat/init.js";
import logger from "./logger/logger.js";
import { ArtifactData, fetchArtifactData } from "./helpers/maven/artifact.js";
import ensureDirClean from "./helpers/fs/ensureDirClean.js";
import vrotsc from "./btva/vrotsc.js";
import vropkg from "./btva/vropkg.js";
import { existsSync } from "fs";
import { getConnectionsDir } from "./helpers/fs/locations.js";
import { addConnection } from "./nat/connection.js";

/**
* This will initialize all the dependencies for NAT
*/
export async function initCmd(args: CliOptions) {
	logger.info("Initializing NAT");
	await resetNatFolder();
	await initDependencies(args);
	await initCertificates(args);
	if (!existsSync(getConnectionsDir())) {
		logger.info("No connection folder found wile initializing, prompting");
		await addConnection(args);
	}
	logger.info("Successfully initialized");
}

/**
* Packages the current working dir to a .package
*/
export async function packageCmd(args: CliOptions) {
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
	logger.info(`Elapsed time generating package: ${(Date.now() - start) / 1000}s`);
}
