export interface ArtifactData {
	version: string,
	artifactId: string,
	groupId: string,
	fullArtifact: string;
}

/**
	* Implement me
	*/
export async function fetchArtifactData() {
	return {
		fullArtifact: 'com.vwmare.pscoe.test',
		artifactId: "test",
		groupId: "com.vwmare.pscoe",
		version: "1.0.0-SNAPSHOT",
	};
}
