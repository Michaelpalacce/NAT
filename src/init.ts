import download from 'mvn-artifact-download';
import { mkdir, readFile, rm } from "fs/promises";
import targz from "targz";
import { promisify } from "util";
import { join } from 'path';
import { getNatConfigDir } from './helpers/fs/locations.js';
import { CliOptions } from './arguments.js';
import logger from './logger/logger.js';
import { existsSync } from 'fs';
import { execa } from 'execa';
import { XMLParser } from "fast-xml-parser";
import decompress from "decompress";

const untar = promisify(targz.decompress);

export async function getPackagingProfile(args: CliOptions) {
	const parser = new XMLParser();
	const settingsXml = parser.parse<any>(await readFile(args.settingsXmlLocation));
	const packagingProfile = settingsXml.settings.profiles.profile.find(p => p.id === args.packagingProfileId);

	if (!packagingProfile)
		throw new Error(`No packaging profile with id: ${args.packagingProfileId} found in ${args.settingsXmlLocation}`);

	return packagingProfile;
}

export async function initCertificates(args: CliOptions) {
	logger.info("Fetching certificates based on settings.xml");
	const packagingProfile = await getPackagingProfile(args);

	const natFolder = getNatConfigDir();
	const keystoreModule = join(natFolder, 'keystore');

	console.log(packagingProfile);

	const keystoreLocation = await download.default(
		{
			artifactId: packagingProfile.properties.keystoreArtifactId,
			groupId: packagingProfile.properties.keystoreGroupId,
			version: packagingProfile.properties.keystoreVersion,
			extension: 'zip'
		},
		natFolder
	);

	await decompress(keystoreLocation, keystoreModule);

	logger.info("Done fetching certificates based on settings.xml");
}

/**
* Will download vrotsc and vropkg to your home directory and npm link them
*/
export async function initDependencies(args: CliOptions) {
	await initCertificates(args);

	throw "HARD STOP";
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
	await untar({
		src: vrotscLocation,
		dest: vrotscModule
	});

	await untar({
		src: vropkgLocation,
		dest: vropkgModule
	});

	logger.debug("Running npm link fro vrotsc and vropkg");
	await execa('npm', ['link'], { cwd: join(vrotscModule, 'package') });
	await execa('npm', ['link'], { cwd: join(vropkgModule, 'package') });

	logger.info("Done setting up vrotsc and vropkg");
}
