import { dirname, join } from "path";
import { CliOptions } from "../../arguments.js";
import { Artifact, MAVEN_METADATA_FILE_NAME, downloadArtifact, downloadMavenMetadata, getPackageNameFromArtifactData, parsePomFile } from "../../helpers/maven/artifact.js";
import targz from "targz";
import logger from "../../logger/logger.js";
import { copyFile, cp, mkdir, rm } from "fs/promises";
import { promisify } from "util";
import { existsSync, readFileSync } from "fs";
const untar = promisify(targz.decompress);
import { parseStringPromise } from 'xml2js';

/**
* Given an artifact with defined dependencies, fetches nested dependencies and then extracts them to the correct place
*/
export async function fetchDependencies(args: CliOptions, artifact: Artifact) {
	await populateArtifactDependencies(args, artifact);
	await fetchArtifactDependencies(args, artifact);
	await fetchBtvaTypes(args);
}

/**
* Fetches all the needed BTVA typedefs
*/
export async function fetchBtvaTypes(args: CliOptions) {
	await Promise.all(
		[
			"ecmascript",
			"jasmine",
			"node",
			"o11n-core",
			"o11n-plugin-activedirectory",
			"o11n-plugin-amqp",
			"o11n-plugin-apic",
			"o11n-plugin-aria",
			"o11n-plugin-azure",
			"o11n-plugin-dynamictypes",
			"o11n-plugin-mail",
			"o11n-plugin-mqtt",
			"o11n-plugin-net",
			"o11n-plugin-nsx",
			"o11n-plugin-powershell",
			"o11n-plugin-rest",
			"o11n-plugin-snmp",
			"o11n-plugin-soap",
			"o11n-plugin-sql",
			"o11n-plugin-ssh",
			"o11n-plugin-vapi",
			"o11n-plugin-vc",
			"o11n-plugin-vcac",
			"o11n-plugin-vcaccafe",
			"o11n-plugin-vcloud",
			"o11n-plugin-vco",
			"o11n-plugin-xml",
			"tslib",
			"vrotsc-annotations",
		]
			.map(artifactName => new Promise<void>(async (resolve) => {
				const type = {
					artifactid: artifactName,
					groupid: "com.vmware.pscoe.ts.types",
					version: args.btvaVersion,
					type: "tgz"
				};

				try {
					const artifactLocation = await downloadArtifact(type);
					await handleTypeDefs(artifactLocation, type, artifactName);
				}
				catch (error) {
					logger.warn(`Skipping... Could not download ${artifactName}, reason: ${error}`);
				}
				resolve();
			}))
	);
}

/**
* Finds the latest pom version for a given dependency
*
* @param dependency - The dependency to find the pom version for
*/
export async function findPomVersion(dependency: Artifact) {
	const metadata = await downloadMavenMetadata({
		artifactid: dependency.artifactid,
		groupid: dependency.groupid,
		version: dependency.version
	});

	const result = await parseStringPromise(readFileSync(metadata));

	// @TODO: Solve me :/
	if (!dependency.version.includes('SNAPSHOT')) {
		throw new Error(`Dependency ${dependency.artifactid} is not a snapshot version, dunno how to deal with that yet`);
	}

	let pomVersion: string = "";

	// find the latest pom version
	for (const index in result?.metadata?.versioning?.[0]?.snapshotVersions?.[0]?.snapshotVersion) {
		const snapshotVersion = result?.metadata?.versioning?.[0]?.snapshotVersions?.[0]?.snapshotVersion?.[index];
		if (snapshotVersion?.extension?.[0] == 'pom') {
			pomVersion = snapshotVersion?.value;
			break;
		}
	}

	if (!pomVersion) {
		throw new Error(`Could not find pom version for ${dependency.artifactid}`);
	}

	return `${dependency.artifactid}-${pomVersion}`;
}

/**
* Populates the artifact with it's nested dependencies by fetching the maven-metadata.xml and parsing it
*/
export async function populateArtifactDependencies(args: CliOptions, artifact: Artifact) {
	if (!artifact.dependencies) {
		return;
	}

	for (const index in artifact.dependencies) {
		const dependency = artifact.dependencies[index];
		let name: string = "";

		try {
			name = await findPomVersion(dependency);
		} catch (error) {
			logger.verbose(`Could not download maven-metadata.xml for ${dependency.artifactid}, reason: ${error}. Trying pom.xml instead`);
		}

		const depPom = await downloadArtifact({
			artifactid: dependency.artifactid,
			groupid: dependency.groupid,
			version: dependency.version,
			// If we found a pom version, use that, otherwise use the default
			name: name,
			type: "pom"
		});

		const depArtifact = await parsePomFile(depPom);
		dependency.dependencies = depArtifact.dependencies;
		if (dependency.dependencies) {
			await populateArtifactDependencies(args, dependency);
		}
	}
}

/**
* Converts the dependency tree to a flat structure, identifies the latest versions of each package and handles them appropriately
*/
export async function fetchArtifactDependencies(args: CliOptions, artifact: Artifact) {
	const dependencyMap = getLatestDependencies(artifact);
	// Convert the Map to an array of Artifact objects
	const latestDependencies: Artifact[] = Array.from(dependencyMap.values());
	Promise.all(latestDependencies.map((dependency) => new Promise<void>(async (resolve) => {
		const artifactLocation = await downloadArtifact(dependency);
		if (dependency.type == "tgz") {
			await handleTypeDefs(artifactLocation, dependency);
		}

		if (dependency.type == "package") {
			await handlePackages(args, artifactLocation, dependency);
		}
		resolve();
	})));
}

/**
* Handler for artifacts of type package
*/
async function handlePackages(args: CliOptions, artifactLocation: string, artifact: Artifact) {
	const outDir = join(process.cwd(), args.outFolder, "dependency", getPackageNameFromArtifactData(artifact));

	logger.debug(`Moving ${artifactLocation} to ${outDir}`);
	const dir = dirname(outDir);

	if (!existsSync(dir))
		await mkdir(dir, { recursive: true });

	await copyFile(artifactLocation, outDir);
}

/**
* Handler for artifacts of type tgz.
* After extraction, we have to move them since they get extracted to an extra "package" directory
*/
async function handleTypeDefs(artifactLocation: string, artifact: Artifact, overwriteName?: string) {
	const name = overwriteName || `${artifact.groupid}.${artifact.artifactid}`;
	const outDir = join(process.cwd(), "node_modules", "@types", name);

	logger.debug(`Decompressing ${artifactLocation} to ${outDir}`);
	await untar({
		src: artifactLocation,
		dest: outDir
	});

	const packageFolderPath = join(outDir, 'package');

	if (existsSync(packageFolderPath)) {
		await cp(`${packageFolderPath}/`, outDir, { recursive: true });

		await rm(packageFolderPath, { recursive: true });
	}
}

/**
* Converts a dep tree to a flat structure with only latest versions
*/
function getLatestDependencies(artifact: Artifact): Map<string, Artifact> {
	const dependencyMap = new Map<string, Artifact>();

	function traverseDependencies(artifact: Artifact): void {
		const { version, dependencies } = artifact;
		const key = getPackageNameFromArtifactData(artifact);

		if (!dependencyMap.has(key) || dependencyMap.get(key)!.version < version) {
			dependencyMap.set(key, artifact);
		}

		if (!dependencies) {
			return;
		}

		for (const dep of dependencies) {
			traverseDependencies(dep);
		}
	}

	if (artifact.dependencies) {
		for (const dep of artifact.dependencies) {
			traverseDependencies(dep);
		}
	}

	return dependencyMap;
}

