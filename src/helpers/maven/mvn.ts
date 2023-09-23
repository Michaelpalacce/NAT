import { execa } from "execa";
import { existsSync } from "fs";
import { join } from "path";
import { CliOptions } from "../../arguments.js";
import download from 'mvn-artifact-download';
import homedir from "../fs/getHomeDir.js";
import { mkdir } from "fs/promises";



/**
* This is a temporary solution that will run mvn clean package to download all the dependencies + definitions + certificates. Will be done only if target does
* not exist 
*/
export async function ensurePackage(containingDir: string, force: boolean): Promise<void> {
	const targetFolder = join(containingDir, "target");
	if (!existsSync(targetFolder) || force) {
		await execa('mvn', ['clean', 'package']);
	}
}

/**
* Will download vrotsc and vropkg to your home directory and npm link them
*/
export async function initDependencies(args: CliOptions) {
	const { btvaVersion } = args;
	const natFolder = join(homedir, ".nat",);

	if (!existsSync(natFolder))
		await mkdir(natFolder);

	await download.default(`com.vmware.pscoe.iac:vrotsc${btvaVersion}`, join(natFolder, 'vrotsc.tgz'));
	await download.default(`com.vmware.pscoe.iac:vropkg${btvaVersion}`, join(natFolder, 'vropkg.tgz'));

}
