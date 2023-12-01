import { join } from "path";
import { CliOptions } from "../../arguments.js";
import { Artifact, downloadArtifact, getPackageNameFromArtifactData, parsePomFile } from "../../helpers/maven/artifact.js";
import targz from "targz";
import logger from "../../logger/logger.js";
import { rename } from "fs/promises";
import { promisify } from "util";
const untar = promisify(targz.decompress);

/**
* Given an artifact with defined dependencies, fetches nested dependencies and then extracts them to the correct place
*/
export async function fetchDependencies(args: CliOptions, artifact: Artifact) {
	await populateArtifactDependencies(args, artifact);
	await fetchArtifactDependencies(args, artifact);
}

/**
* Populates the artifact with it's nested dependencies by fetching pom files
*/
export async function populateArtifactDependencies(args: CliOptions, artifact: Artifact) {
	if (artifact.dependencies) {
		for (const index in artifact.dependencies) {
			const dependency = artifact.dependencies[index];

			const depPom = await downloadArtifact({
				artifactid: dependency.artifactid,
				groupid: dependency.groupid,
				type: "pom",
				version: dependency.version
			});

			const depArtifact = await parsePomFile(depPom);
			dependency.dependencies = depArtifact.dependencies;
			if (dependency.dependencies) {
				await populateArtifactDependencies(args, dependency);
			}
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

	for (const dependency of latestDependencies) {
		const artifactLocation = await downloadArtifact(dependency);
		if (dependency.type == "tgz") {
			await handleTypeDefs(artifactLocation, artifact);
		}

		if (dependency.type == "package") {
			await handlePackages(args, artifactLocation, artifact);
		}
	}
}

/**
* Handler for artifacts of type package
*/
async function handlePackages(args: CliOptions, artifactLocation: string, artifact: Artifact) {
	const outDir = join(process.cwd(), args.outFolder, "dependency", getPackageNameFromArtifactData(artifact));

	logger.debug(`Moving ${artifactLocation} to ${outDir}`);
	await rename(artifactLocation, outDir);
}

/**
* Handler for artifacts of type tgz
*/
async function handleTypeDefs(artifactLocation: string, artifact: Artifact) {
	const outDir = join(process.cwd(), "node_modules", "@types", `${artifact.groupid}.${artifact.artifactid}`);

	logger.debug(`Decompressing ${artifactLocation} to ${outDir}`);
	await untar({
		src: artifactLocation,
		dest: outDir
	});
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

