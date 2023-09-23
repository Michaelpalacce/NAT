import { execa } from "execa";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import { join } from "path";

/**
* This is a temporary solution that will run mvn clean package to download all the dependencies + definitions + certificates. Will be done only if target does
* not exist 
*/
export async function ensurePackage(containingDir: string, force: boolean): Promise<void> {
	const targetFolder = join(containingDir, "target");
	if (force)
		await rm(targetFolder, { recursive: true });

	if (!existsSync(targetFolder)) {
		await execa('mvn', ['clean', 'package']);
	}
}
