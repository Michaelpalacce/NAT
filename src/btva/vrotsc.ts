import { execa } from "execa";
import { ArtifactData } from "../artifact.js";


/**
* This will run vrotsc, it will transpile the code to js
*/
export default async function(outFolder: string, artifactData: ArtifactData) {
	const { artifactId, fullArtifact } = artifactData;

	console.log("Running vrotsc");
	await execa('vrotsc', [
		'src',
		'--actionsNamespace', fullArtifact,
		'--workflowsNamespace', artifactId,
		'--files',
		'--typesOut', `${outFolder}/vro-types`,
		'--testsOut', `${outFolder}/vro-sources/test/com/vmware/pscoe/test`,
		'--mapsOut', `${outFolder}/vro-sources/map/com/vmware/pscoe/test`,
		'--actionsOut', `${outFolder}/vro-sources/js/src/main/resources/com/vmware/pscoe/test`,
		'--testHelpersOut', `${outFolder}/vro-sources/testHelpers/src/main/resources/com/vmware/pscoe/test`,
		'--workflowsOut', `${outFolder}/vro-sources/xml/src/main/resources/Workflow`,
		'--policiesOut', `${outFolder}/vro-sources/xml/src/main/resources/PolicyTemplate`,
		'--resourcesOut', `${outFolder}/vro-sources/xml/src/main/resources/ResourceElement`,
		'--configsOut', `${outFolder}/vro-sources/xml/src/main/resources/ConfigurationElement`
	]);
	console.log("Finished vrotsc");
}