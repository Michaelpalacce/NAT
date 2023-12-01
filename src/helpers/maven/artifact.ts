import { promisify } from "util";
import { join } from "path";
import { createWriteStream, existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import logger from "../../logger/logger.js";
import axios from "axios";
import { getConfig } from "../config.js";
import { getDependenciesDir } from "../fs/locations.js";

import pomParser from "pom-parser";
const parsePom = promisify(pomParser.parse);
const ARTIFACT_LOCK_FILE_NAME = 'nat.lock';

let artifact: Artifact;

export interface Artifact {
	version: string,
	artifactid: string,
	groupid: string,
	type?: string,
	dependencies?: Artifact[];
}

/*
* This will return the repo path for the maven artifact.
*/
export function getPathFromArtifact(artifact: Artifact) {
	return `${artifact.groupid.replaceAll(".", "/")}/${artifact.artifactid}/${artifact.version}/${artifact.artifactid}-${artifact.version}.${artifact.type || 'package'}`;
}

/**
* Forms the package name following BTVA's naming standard
*/
export function getPackageNameFromArtifactData(artifactData: Artifact) {
	return `${artifactData.groupid}.${artifactData.artifactid}-${artifactData.version}.${artifactData.type || 'package'}`;
}

/**
* Helper function to download artifacts from maven artifactories
* @param artifact The artifact to download
* @param [force=false] Defines whether we should force download a new version.
*/
export async function downloadArtifact(artifact: Artifact, location?: string, force: boolean = false): Promise<string> {
	const artifactName = getPackageNameFromArtifactData(artifact);
	let outLocation = join(getDependenciesDir(), artifactName);
	if (location) {
		outLocation = join(location, artifactName);
	}

	if (existsSync(outLocation) && !force) {
		logger.info(`Artifact: ${artifactName} already exists, skipping`);
		return outLocation;
	}

	const config = getConfig();
	const response = await axios.get(`${config?.repo?.url}/${getPathFromArtifact(artifact)}`, {
		auth: {
			username: config?.repo?.username,
			password: config?.repo?.password
		},
		responseType: "stream"
	});

	const writer = createWriteStream(outLocation, { flags: "w" });
	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on('finish', () => {
			logger.info(`Artifact: ${artifactName} downloaded`);
			resolve(outLocation);
		});
		writer.on('error', reject);
	});
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
 * After fetching the artifact once, we'll save the data in memory and use that instead to speed up the process. You can disable this by passing force = true
 */
export async function fetchProjectArtifactData(containingDir: string, force: boolean = false): Promise<Artifact> {
	logger.debug("Fetching artifact data");
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
			artifactid: project.artifactid,
			groupid: project.groupid,
			version: project.version,
			type: project.packaging,
			dependencies: pomResponse.pomObject.project.dependencies.dependency
		};

		const body = JSON.stringify(artifact, null, 4);

		logger.debug(`Extracted ArtifactData: ${body}`);
		await writeFile(lockFileLocation, body);
	}

	logger.debug("Done fetching artifact data");
	return artifact;
}
