import { promisify } from "util";
import { join } from "path";
import { createWriteStream, existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import logger from "../../logger/logger.js";
import axios, { AxiosResponse } from "axios";
import { getConfig } from "../config.js";
import { getDependenciesDir } from "../fs/locations.js";

import pomParser from "pom-parser";
const parsePom = promisify(pomParser.parse);
const ARTIFACT_LOCK_FILE_NAME = 'nat.lock';

export const MAVEN_METADATA_FILE_NAME = "maven-metadata.xml";

let artifact: Artifact;

export interface Artifact {
	version: string,
	artifactid: string,
	groupid: string,
	// This is optionally used to override the groupid, artifactid and version
	name?: string,
	type?: string,
	dependencies?: Artifact[];
}

/*
* This will return the repo path for the maven artifact.
* artifact.name will override the groupid, artifactid and version
*/
export function getPathFromArtifact(artifact: Artifact) {
	const name = artifact.name || `${artifact.artifactid}-${artifact.version}`;
	return `${artifact.groupid.replaceAll(".", "/")}/${artifact.artifactid}/${artifact.version}/${name}.${artifact.type || 'package'}`;
}

/*
* This will return the repo path for the maven artifact.
*/
export function getMavenMetadataPathFromArtifact(artifact: Artifact) {
	return `${artifact.groupid.replaceAll(".", "/")}/${artifact.artifactid}/${artifact.version}/${MAVEN_METADATA_FILE_NAME}`;
}

/**
* Forms the package name following BTVA's naming standard
*/
export function getPackageNameFromArtifactData(artifactData: Artifact) {
	return `${artifactData.groupid}.${artifactData.artifactid}-${artifactData.version}.${artifactData.type || 'package'}`;
}

/**
* Helper function to download maven metadata from maven artifactories
*/
export async function downloadMavenMetadata(artifact: Artifact) {
	return await downloadArtifact({
		artifactid: artifact.artifactid,
		groupid: artifact.groupid,
		version: artifact.version,
		type: MAVEN_METADATA_FILE_NAME
	});
}

/**
* Helper function to download artifacts from maven artifactories
* This will take the config settings, one of them for caching will be taken too, to determine if we should keep artifacts
* If the artifact type is maven-metadata.xml, it will download the metadata file instead
*
* @param artifact The artifact to download
*/
export async function downloadArtifact(artifact: Artifact, location?: string): Promise<string> {
	const artifactName = getPackageNameFromArtifactData(artifact);
	let outLocation = join(getDependenciesDir(), artifactName);
	if (location) {
		outLocation = join(location, artifactName);
	}
	const config = getConfig();
	const cache = config?.repo?.cache || false;

	if (existsSync(outLocation) && cache) {
		logger.debug(`Artifact: ${artifactName} already exists, skipping`);
		return outLocation;
	}

	let url = `${config?.repo?.url}/${getPathFromArtifact(artifact)}`;
	if (artifact.type == MAVEN_METADATA_FILE_NAME) {
		url = `${config?.repo?.url}/${getMavenMetadataPathFromArtifact(artifact)}`;
	}

	logger.verbose(`Getting artifact from: ${url}`);
	let response: AxiosResponse<any, any>;

	try {
		response = await axios.get(url, {
			auth: {
				username: config?.repo?.username,
				password: config?.repo?.password
			},
			responseType: "stream"
		});
	}
	catch (e) {
		throw new Error(`Error trying to fetch artifact: ${url}. Error was: ${e}`);
	}

	const writer = createWriteStream(outLocation, { flags: "w" });
	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on('finish', () => {
			logger.debug(`Artifact: ${artifactName} downloaded`);
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
* Parses the pom and remaps it accordingly to Artifact interface
*/
export async function parsePomFile(filePath: string): Promise<Artifact> {
	let pomResponse: any;

	try {
		pomResponse = await parsePom({ filePath });
	}
	catch (e) {
		throw new Error(`POM: ${filePath} was not parsed successfully. Error was: ${e}`);
	}

	const project = pomResponse.pomObject.project;

	return {
		artifactid: project.artifactid,
		groupid: project.groupid,
		version: project.version,
		type: project.packaging,
		dependencies: project?.dependencies?.dependency
	};
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
		logger.debug(`NO ${ARTIFACT_LOCK_FILE_NAME} found, parsing pom.xml`);
		artifact = await parsePomFile(join(containingDir, "pom.xml"));
		const body = JSON.stringify(artifact, null, 4);

		logger.debug(`Extracted ArtifactData: ${body}`);
		await writeFile(lockFileLocation, body);
	}

	logger.debug("Done fetching artifact data");
	return artifact;
}

