
// @TODO MOVE ALL Locations here :)

import { homedir } from "os";
import { join } from "path";

export function getHomedir() {
	return homedir();
}

/**
* The default settings.xml location 
* NOTE: Is an input, but it shouldn't be needed in the future....
*/
export function getSettingsXmlLocation() {
	return join(getHomedir(), ".m2", "settings.xml");
}

/**
* Contains global configurations needed for nat to work
*/
export function getNatConfigDir() {
	return join(getHomedir(), ".nat");
}

/**
* Gets the location to the pre-extracted certificates
*/
export function getCertificates() {
	return {
		privateKeyPem: join(getNatConfigDir(), 'keystore', 'private_key.pem'),
		certPem: join(getNatConfigDir(), 'keystore', 'cert.pem')
	};
}
