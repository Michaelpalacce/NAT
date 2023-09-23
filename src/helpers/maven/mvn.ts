import { execa } from "execa";
import { existsSync } from "fs";
import { join } from "path";
import logger from "../../logger/logger.js";

/**
* This is a temporary solution that will run mvn clean package to download all the dependencies + definitions + certificates. Will be done only if target does
* not exist 
*/
export async function ensurePackage(containingDir: string, force: boolean): Promise<void> {
	const targetFolder = join(containingDir, "target");
	if (!existsSync(targetFolder) || force) {
		logger.info('TEMP: target folder not found, for now it\'s needed to fetch the certificates. Running mvn clean package');
		await execa('mvn', ['clean', 'package']);
		logger.info('TEMP: Done running mvn clean package');
	}
}
