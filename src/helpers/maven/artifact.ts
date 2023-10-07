import { promisify } from "util";
import pomParser from "pom-parser";
import { join } from "path";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import logger from "../../logger/logger.js";

const parsePom = promisify(pomParser.parse);
const ARTIFACT_LOCK_FILE_NAME = 'nat.lock';

let artifact: ArtifactData;

//@TODO FINISH ME WHEN WE GET THERE
export interface Dependency {

}

export interface ArtifactData {
	version: string,
	artifactId: string,
	groupId: string,
	dependencies: Dependency[];
}

/**
* Checks and reads the lock file
*/
export async function readLockFile(lockFileLocation: string): Promise<string | null> {
	const hasLock = existsSync(lockFileLocation);

	return hasLock ? (await readFile(lockFileLocation)).toString() : null;
}

/**
 * Utilizes the pom parser node module to extract details from the pom.
 * Will Create a lock file with the details extracted and that lock file will be read in the future instead.
 * This is done to minimize the overhead of converting the code
 * @TODO Save this once fetched in memory?
 */
export async function fetchArtifactData(containingDir: string, force: boolean = false): Promise<ArtifactData> {
	logger.info("Fetching artifact data");
	if (artifact && !force) {
		return artifact;
	}

	const lockFileLocation = join(containingDir, ARTIFACT_LOCK_FILE_NAME);
	const lockData = await readLockFile(lockFileLocation);

	if (lockData) {
		try {
			artifact = JSON.parse(lockData);
		}
		catch (e) {
			throw new Error(`Error while trying to parse the data retrieved from ${lockFileLocation}, check that the format is correct. Error was: ${e}`);
		}

		logger.debug(`Discovered existing artifact from ${ARTIFACT_LOCK_FILE_NAME}: ${JSON.stringify(artifact, null, 4)}`);
	}
	else {
		logger.debug(`No ${ARTIFACT_LOCK_FILE_NAME} found, trying to parse the pom.xml`);
		let pomResponse: any;

		try {
			pomResponse = await parsePom({
				filePath: join(containingDir, "pom.xml")
			});
		}
		catch (e) {
			throw new Error(`No ${ARTIFACT_LOCK_FILE_NAME} found in ${containingDir} and pom.xml was not parsed successfully. Error was: ${e}`);
		}

		const project = pomResponse.pomObject.project;

		artifact = {
			artifactId: project.artifactid,
			groupId: project.groupid,
			version: project.version,
			dependencies: []
		};

		const body = JSON.stringify(artifact, null, 4);

		logger.debug(`Extracted ArtifactData: ${body}`);
		await writeFile(lockFileLocation, body);
	}

	logger.info("Done fetching artifact data");
	return artifact;
}
