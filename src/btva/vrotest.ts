import { execa } from "execa";
import { ArtifactData } from "../helpers/maven/artifact.js";
import { CliOptions } from "../arguments.js";
import logger from "../logger/logger.js";



// [/home/stefan/Projects/Testing/test/node_modules/@vmware-pscoe/vrotest/bin/vrotest, build, 
// --actions, /home/stefan/Projects/Testing/test/target/vro-sources/js/src/main/resources, 
// --testHelpers, /home/stefan/Projects/Testing/test/target/vro-sources/testHelpers/src/main/resources, 
// --tests, /home/stefan/Projects/Testing/test/target/vro-sources/test, 
// --maps, /home/stefan/Projects/Testing/test/target/vro-sources/map, 
// --resources, /home/stefan/Projects/Testing/test/target/vro-sources/xml/src/main/resources/ResourceElement, 
// --configurations, /home/stefan/Projects/Testing/test/target/vro-sources/xml/src/main/resources/ConfigurationElement, 
// --ts-src, src, 
// --ts-namespace, com/vmware/pscoe/test, 
// --dependencies, /home/stefan/Projects/Testing/test/target/dependency/vro, 
// --helpers, /home/stefan/Projects/Testing/test/node_modules/@vmware-pscoe/vro-scripting-api/lib, 
// --output, /home/stefan/Projects/Testing/test/target/vro-tests]
// [/home/stefan/Projects/Testing/test/node_modules/@vmware-pscoe/vrotest/bin/vrotest, run, target/vro-tests]

// [/home/stefan/Projects/Testing/test/node_modules/@vmware-pscoe/vrotest/bin/vrotest, build, --actions, /home/stefan/Projects/Testing/test/target/vro-sources/js/src/main/resources, --testHelpers, /home/stefan/Projects/Testing/test/target/vro-sources/test
// Helpers/src/main/resources, --tests, /home/stefan/Projects/Testing/test/target/vro-sources/test, --maps, /home/stefan/Projects/Testing/test/target/vro-sources/map, --resources, /home/stefan/Projects/Testing/test/target/vro-sources/xml/src/main/resource
// s/ResourceElement, --configurations, /home/stefan/Projects/Testing/test/target/vro-sources/xml/src/main/resources/ConfigurationElement, --ts-src, src, --ts-namespace, com/vmware/pscoe/test, --dependencies, /home/stefan/Projects/Testing/test/target/depe
// ndency/vro, --helpers, /home/stefan/Projects/Testing/test/node_modules/@vmware-pscoe/vro-scripting-api/lib, --output, /home/stefan/Projects/Testing/test/target/vro-tests]

/**
* This will run vrotest, used to running unit tests
*/
export default async function(args: CliOptions, artifactData: ArtifactData) {
	const { outFolder } = args;
	const { artifactId, groupId } = artifactData;

	const namespace = `${groupId}.${artifactId}`;

	const start = Date.now();
	logger.info(`Running vrotest.`);
	//@ts-ignore
	const { stdout } = await execa('vrotest', [
		'build',
		'--actions', `${outFolder}/vro-sources/js/src/main/resources`,
		'--testHelpers', `${outFolder}/vro-sources/testHelpers/src/main/resources`,
		'--tests', `${outFolder}/vro-sources/test`,
		'--maps', `${outFolder}/vro-sources/map`,
		'--resources', `${outFolder}/vro-sources/xml/src/main/resources/ResourceElement`,
		'--configurations', `${outFolder}/vro-sources/xml/src/main/resources/ConfigurationElement`,
		'--ts-src', `src`,
		'--ts-namespace', namespace,
		'--dependencies', `target/dependency/vro`, // @TODO FIX THIS LATER ON WHEN WE CAN DOWNLOAD DEPENDENCIES
		'--helpers', `node_modules/@vmware-pscoe/vro-scripting-api/lib`,
		'--output', `${outFolder}/vro-tests`,
	]);

	//@ts-ignore
	await execa('vrotest', ['run', `${outFolder}/vro-tests`]).pipeStdout(process.stdout).pipeStderr(process.stderr);
	logger.info(`Finished running vrotest. Took: ${(Date.now() - start) / 1000}s`);
}
