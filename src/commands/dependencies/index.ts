import { CliOptions } from "../../arguments.js";
import { Artifact, downloadArtifact } from "../../helpers/maven/artifact.js";

export async function fetchDependencies(args: CliOptions, artifact: Artifact) {
	const deps = artifact.dependencies;
	if (deps) {
		for (const artifact of deps) {
			const artifactLocation = await downloadArtifact(artifact);
			if (artifact.type == "tgz") {

			}

			// logger.debug(`Decompressing ${artifact.artifactid} to ${moduleLocation}`);
			// await untar({
			// 	src: artifactLocation,
			// 	dest: join("node_modules")
			// });
		}
	}
}
