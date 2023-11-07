import { homedir } from "os";
import { join } from "path";

export const PRIVATE_KEY_PEM_NAME = 'private_key.pem';
export const CERT_PEM_NAME = 'cert.pem';
export const CERT_PASS_NAME = 'cert.pass';


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
* Location where the keystore is stored
*/
export function getKeystoreDir() {
	return join(getNatConfigDir(), "keystore");
}

/**
* This is where all the connections are stored
*/
export function getConnectionsDir() {
	return join(getNatConfigDir(), 'connections');
}

/**
* Gets the location to the pre-extracted certificates
*/
export function getCertificates() {
	return {
		privateKeyPem: join(getKeystoreDir(), PRIVATE_KEY_PEM_NAME),
		certPem: join(getKeystoreDir(), CERT_PEM_NAME),
		certPass: join(getKeystoreDir(), CERT_PASS_NAME)
	};
}
