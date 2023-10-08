import { execa } from "execa";
import { ArtifactData } from "../helpers/maven/artifact.js";
import { CliOptions } from "../arguments.js";
import logger from "../logger/logger.js";

// [/home/stefan/Projects/Testing/test/node_modules/@vmware-pscoe/vrotsc/bin/vrotsc, src, --actionsNamespace, com.vmware.pscoe.test, --workflowsNamespace, test, --files, , --typesOut, target/vro-types, --testsOut, target/vro-sources/test/com/vmware/pscoe/
// test, --mapsOut, target/vro-sources/map/com/vmware/pscoe/test, --actionsOut, target/vro-sources/js/src/main/resources/com/vmware/pscoe/test, --testHelpersOut, target/vro-sources/testHelpers/src/main/resources/com/vmware/pscoe/test, --workflowsOut, targ
// et/vro-sources/xml/src/main/resources/Workflow, --policiesOut, target/vro-sources/xml/src/main/resources/PolicyTemplate, --resourcesOut, target/vro-sources/xml/src/main/resources/ResourceElement, --configsOut, target/vro-sources/xml/src/main/resources/
// ConfigurationElement]
/**
* This will run vrotsc, it will transpile the code to js
*/
export default async function(args: CliOptions, artifactData: ArtifactData) {
	const { outFolder } = args;
	const { artifactId, groupId } = artifactData;
	const namespace = `${groupId}.${artifactId}`;
	const namespacePath = namespace.replaceAll('.', '/');

	const start = Date.now();
	logger.info(`Running vrotsc.`);
	await execa('vrotsc', [
		'src',
		'--actionsNamespace', `${groupId}.${artifactId}`,
		'--workflowsNamespace', artifactId,
		'--files',
		'--typesOut', `${outFolder}/vro-types`,
		'--testsOut', `${outFolder}/vro-sources/test/com/vmware/test`,
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
