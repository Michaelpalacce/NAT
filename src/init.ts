import download from 'mvn-artifact-download';
import { mkdir, rm } from "fs/promises";
import targz from "targz";
import { promisify } from "util";
import { join } from 'path';
import { getNatConfigDir } from './helpers/fs/locations.js';
import { CliOptions } from './arguments.js';
import logger from './logger/logger.js';
import { existsSync } from 'fs';
import { execa } from 'execa';

const decompress = promisify(targz.decompress);

/**
* Will download vrotsc and vropkg to your home directory and npm link them
*/
export async function initDependencies(args: CliOptions) {
	const { btvaVersion } = args;

	const natFolder = getNatConfigDir();
	const vropkgModule = join(natFolder, 'vropkg');
	const vrotscModule = join(natFolder, 'vrotsc');

	logger.info(`Setting up vrotsc and vropkg in ${natFolder}`);

	if (existsSync(natFolder))
		await rm(natFolder, { recursive: true });

	await mkdir(natFolder);

	logger.debug("Downloading vrotsc and vropkg");
	const vrotscLocation = await download.default(
		{
			artifactId: 'vrotsc',
			groupId: "com.vmware.pscoe.iac",
			version: btvaVersion,
			extension: 'tgz'
		},
		natFolder
	);
	const vropkgLocation = await download.default(
		{
			artifactId: "vropkg",
			groupId: "com.vmware.pscoe.iac",
			version: btvaVersion,
			extension: "tgz"
		},
		natFolder
	);

	logger.debug("Decompressing vropkg and vrotsc");
	// decompress files from tar.gz archive
	await decompress({
		src: vrotscLocation,
		dest: vrotscModule
	});

	await decompress({
		src: vropkgLocation,
		dest: vropkgModule
	});

	logger.debug("Running npm link fro vrotsc and vropkg");
	await execa('npm', ['link'], { cwd: join(vrotscModule, 'package') });
	await execa('npm', ['link'], { cwd: join(vropkgModule, 'package') });

	logger.info("Done setting up vrotsc and vropkg");
}
