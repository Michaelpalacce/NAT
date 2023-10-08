import { execa } from "execa";
import { ArtifactData } from "../helpers/maven/artifact.js";
import { CliOptions } from "../arguments.js";
import logger from "../logger/logger.js";

/**
* This will run vrotest, used to running unit tests
*/
export default async function(args: CliOptions, artifactData: ArtifactData) {
	const { outFolder } = args;
	const { artifactId, groupId } = artifactData;

	const start = Date.now();
	logger.info(`Running vrotest.`);
	await execa('vrotest', [
		'build',
		'--actions', ``,
		'--testHelpers', ``,
		'--tests', ``,
		'--maps', ``,
		'--resources', ``,
		'--configurations', ``,
		'--dependencies', ``,
		'--helpers', ``,
		'--ts-src', ``,
		'--ts-namespace', ``,
		'--output', ``,
	]);
	logger.info(`Finished running vrotest. Took: ${(Date.now() - start) / 1000}s`);
}
