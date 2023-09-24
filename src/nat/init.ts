import download from 'mvn-artifact-download';
import { copyFile, mkdir, rm } from "fs/promises";
import targz from "targz";
import { promisify } from "util";
import { join } from 'path';
import { CERT_PEM_NAME, PRIVATE_KEY_PEM_NAME, getCertificates, getKeystoreDir, getNatConfigDir } from '../helpers/fs/locations.js';
import { CliOptions } from '../arguments.js';
import logger from '../logger/logger.js';
import { existsSync } from 'fs';
import { execa } from 'execa';
import ensureDirExists from '../helpers/fs/ensureDirExists.js';
const untar = promisify(targz.decompress);

/**
* Clears up the NAT folder so we can initialize again
*/
export async function resetNatFolder() {
	const natFolder = getNatConfigDir();

	await Promise.all(['vrotsc', 'vropkg', 'keystore'].map(folder => new Promise<void>(async (resolve) => {
		const toDelete = join(natFolder, folder);
		if (existsSync(toDelete))
			await rm(toDelete, { recursive: true });

		await mkdir(toDelete, { recursive: true });
		resolve();
	})));
}


/**
* Sets the certificates for vropkg to use. They must be present on the FS.
* Support for maven repositories is not planned... that would involve relying on maven to fetch them.
*/
export async function initCertificates(args: CliOptions) {
	const natFolder = getNatConfigDir();

	const keystoreModule = getKeystoreDir();
	const certificatesLocation = args.keystoreLocation;

	const certLocation = join(certificatesLocation, CERT_PEM_NAME);
	const privateKeyLocation = join(certificatesLocation, PRIVATE_KEY_PEM_NAME);

	logger.info(`Setting up keystore in ${natFolder} from ${certificatesLocation}`);

	if (!existsSync(certificatesLocation))
		throw new Error(`${certificatesLocation} does not exist`);

	if (!existsSync(certLocation))
		throw new Error(`cert.pem not found in ${certificatesLocation}`);

	if (!existsSync(privateKeyLocation))
		throw new Error(`private_key.pem not found in ${certificatesLocation}`);

	logger.debug(`Copying certificates to ${keystoreModule}`);

	await ensureDirExists(keystoreModule);

	await copyFile(certLocation, getCertificates().certPem);
	await copyFile(privateKeyLocation, getCertificates().privateKeyPem);

	logger.info("Done setting up keystore");
}

/**
* Will download vrotsc and vropkg to your home directory and npm link them
*/
export async function initDependencies(args: CliOptions) {
	const { btvaVersion } = args;

	const natFolder = getNatConfigDir();
	const vropkgModule = join(natFolder, 'vropkg');
	const vrotscModule = join(natFolder, 'vrotsc');

	logger.info(`Setting up vrotsc and vropkg in ${natFolder}`);

	logger.debug("Downloading vrotsc and vropkg");
	const vropkgLocation = await download.default(
		{
			artifactId: "vropkg",
			groupId: "com.vmware.pscoe.iac",
			version: btvaVersion,
			extension: "tgz"
		},
		natFolder
	);

	logger.debug(`Downloaded vropkg to ${vropkgLocation}`);
	const vrotscLocation = await download.default(
		{
			artifactId: 'vrotsc',
			groupId: "com.vmware.pscoe.iac",
			version: btvaVersion,
			extension: 'tgz'
		},
		natFolder
	);

	logger.debug(`Downloaded vrotsc to ${vrotscLocation}`);
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

	logger.debug("Running npm link for vrotsc and vropkg");

	await execa('npm', ['link'], { cwd: join(vrotscModule, 'package') });
	await execa('npm', ['link'], { cwd: join(vropkgModule, 'package') });

	logger.info("Done setting up vrotsc and vropkg");
}

////////////////////////////////// Archive, may be useful /////////////////////////////////////////////
//
// import decompress from "decompress";
// import { XMLParser } from "fast-xml-parser";
//
// export async function getPackagingProfile(args: CliOptions) {
// 	const parser = new XMLParser();
// 	const settingsXml = parser.parse<any>(await readFile(args.settingsXmlLocation));
// 	const packagingProfile = settingsXml.settings.profiles.profile.find(p => p.id === args.packagingProfileId);
//
// 	if (!packagingProfile)
// 		throw new Error(`No packaging profile with id: ${args.packagingProfileId} found in ${args.settingsXmlLocation}`);
//
// 	return packagingProfile;
// }
// /**
// * Fetches the certificates based on artifactId and groupId and extracts them to the nat subdir... 
// * @TODO: Make it work with local certificates
// */
// export async function initCertificatesBasedOnMaven(args: CliOptions) {
// 	logger.info("Fetching certificates based on settings.xml.. Curently only supports fetching from the configured artifactory");
// 	const packagingProfile = await getPackagingProfile(args);
//
// 	const natFolder = getNatConfigDir();
// 	const keystoreModule = join(natFolder, 'keystore');
//
// 	const keystoreLocation = await download.default(
// 		{
// 			artifactId: packagingProfile.properties.keystoreArtifactId,
// 			groupId: packagingProfile.properties.keystoreGroupId,
// 			version: packagingProfile.properties.keystoreVersion,
// 			extension: 'zip'
// 		},
// 		natFolder
// 	);
//
// 	await decompress(keystoreLocation, keystoreModule);
//
// 	const keystoreSubDir = `${packagingProfile.properties.keystoreArtifactId}-${packagingProfile.properties.keystoreVersion}`;
// 	await rename(
// 		join(keystoreModule, keystoreSubDir, 'cert.pem'),
// 		join(keystoreModule, 'cert.pem')
// 	);
//
// 	await rename(
// 		join(keystoreModule, keystoreSubDir, 'private_key.pem'),
// 		join(keystoreModule, 'private_key.pem')
// 	);
//
// 	await rm(join(keystoreModule, keystoreSubDir));
// 	logger.info("Done fetching certificates based on settings.xml");
// }
//
