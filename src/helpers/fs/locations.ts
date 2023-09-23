
// @TODO MOVE ALL Locations here :)

import { homedir } from "os";
import { join } from "path";

export function getHomedir() {
	return homedir();
}

/**
* Contains global configurations needed for nat to work
*/
export function getNatConfigDir() {
	return join(getHomedir(), ".nat");
}
