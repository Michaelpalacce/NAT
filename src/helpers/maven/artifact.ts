import { promisify } from "util";
var pomParser = require("pom-parser");

const parsePom = promisify(pomParser.parse);


export interface ArtifactData {
	version: string,
	artifactId: string,
	groupId: string,
	fullArtifact: string;
}

/**
 * Implement me
 */
export async function fetchArtifactData(pomPath: string) {
	const pomResponse = await parsePom({
		filePath: pomPath
	});

	// The original pom xml that was loaded is provided.
	console.log("XML: " + pomResponse.pomXml);
	// The parsed pom pbject.
	console.log("OBJECT: " + JSON.stringify(pomResponse.pomObject));

	return {
		fullArtifact: 'com.vwmare.pscoe.test',
		artifactId: "test",
		groupId: "com.vwmare.pscoe",
		version: "1.0.0-SNAPSHOT",
	};
}
