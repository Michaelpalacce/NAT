import { execa } from "execa";
import { ArtifactData } from "../helpers/maven/artifact.js";
import { CliOptions } from "../arguments.js";
import logger from "../logger/logger.js";

/**
* This will run vrotsc, it will transpile the code to js
*/
export default async function(args: CliOptions, artifactData: ArtifactData, watchFiles?: string) {
	const { outFolder, files } = args;
	const { artifactId, groupId } = artifactData;
	const namespace = `${groupId}.${artifactId}`;
	const namespacePath = namespace.replaceAll('.', '/');

	const start = Date.now();
	logger.info(`Running vrotsc.`);
	await execa('vrotsc', [
		'src',
		'--actionsNamespace', `${groupId}.${artifactId}`,
		'--workflowsNamespace', artifactId,
		'--files', watchFiles || files,
		'--typesOut', `${outFolder}/vro-types`,
		'--testsOut', `${outFolder}/vro-sources/test/${namespacePath}`,
		'--mapsOut', `${outFolder}/vro-sources/map/${namespacePath}`,
		'--actionsOut', `${outFolder}/vro-sources/js/src/main/resources/${namespacePath}`,
		'--testHelpersOut', `${outFolder}/vro-sources/testHelpers/src/main/resources/${namespacePath}`,
		'--workflowsOut', `${outFolder}/vro-sources/xml/src/main/resources/Workflow`,
		'--policiesOut', `${outFolder}/vro-sources/xml/src/main/resources/PolicyTemplate`,
		'--resourcesOut', `${outFolder}/vro-sources/xml/src/main/resources/ResourceElement`,
		'--configsOut', `${outFolder}/vro-sources/xml/src/main/resources/ConfigurationElement`
	]);
	logger.info(`Finished running vrotsc. Took: ${(Date.now() - start) / 1000}s`);
}
