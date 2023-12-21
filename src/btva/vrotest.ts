import { execa } from "execa";
import { Artifact } from "../helpers/maven/artifact.js";
import { CliOptions } from "../arguments.js";
import logger from "../logger/logger.js";

/**
* This will run vrotest, used to running unit tests
*/
export default async function(args: CliOptions, artifactData: Artifact) {
	const { outFolder } = args;
	const { artifactid: artifactId, groupid: groupId } = artifactData;

	const namespace = `${groupId}.${artifactId}`;

	const start = Date.now();
	logger.info(`Running vrotest.`);

	await execa('vrotest', [
		'build',
		'--actions', `${outFolder}/vro-sources/js/src/main/resources`,
		'--testHelpers', `${outFolder}/vro-sources/testHelpers/src/main/resources`,
		'--tests', `${outFolder}/vro-sources/test`,
		'--maps', `${outFolder}/vro-sources/map`,
		'--resources', `${outFolder}/vro-sources/xml/src/main/resources/ResourceElement`,
		'--configurations', `${outFolder}/vro-sources/xml/src/main/resources/ConfigurationElement`,
		'--ts-src', `src`,
		'--ts-namespace', namespace,
		'--dependencies', `${outFolder}/dependency`,
		'--helpers', 'node_modules/@vmware-pscoe/vro-scripting-api/lib',
		'--output', `${outFolder}/vro-tests`,
	]);

	//@ts-ignore
	await execa('vrotest', ['run', `${outFolder}/vro-tests`]).pipeStdout(process.stdout).pipeStderr(process.stderr).catch(e => e);
	logger.info(`Finished running vrotest. Took: ${(Date.now() - start) / 1000}s`);
}
