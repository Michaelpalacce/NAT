import { copyFile, mkdir, rm, writeFile } from "fs/promises";
import { promisify } from "util";
import { join } from 'path';
import { CERT_PEM_NAME, PRIVATE_KEY_PEM_NAME, getCertificates, getKeystoreDir, getNatConfig, getNatConfigDir } from '../../helpers/fs/locations.js';
import { DEFAULT_CERT_PASSWORD } from "./defaults.js";
import { CliOptions } from '../../arguments.js';
import logger from '../../logger/logger.js';
import { existsSync, writeFileSync } from 'fs';
import { execa } from 'execa';
import ensureDirExists from '../../helpers/fs/ensureDirExists.js';
import inquirer from 'inquirer';
import { downloadArtifact } from "../../helpers/maven/artifact.js";
import targz from "targz";
const untar = promisify(targz.decompress);

/**
* Clears up the NAT folder so we can initialize again
*/
export async function resetNatFolder() {
	const natFolder = getNatConfigDir();

	await Promise.all(['vrotsc', 'vropkg', 'vrotest', 'keystore', "dependencies"].map(folder => new Promise<void>(async (resolve) => {
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

	const answers = await inquirer.prompt([
		{
			name: "password",
			type: "password",
			message: `Whats The password for the private key? [${DEFAULT_CERT_PASSWORD}]`,
			default: DEFAULT_CERT_PASSWORD
		}
	]);

	await copyFile(certLocation, getCertificates().certPem);
	await copyFile(privateKeyLocation, getCertificates().privateKeyPem);
	await writeFile(getCertificates().certPass, answers.password);

	logger.info("Done setting up keystore");
}

/**
* Logic relevant to initializing node modules fetching them from a mvn repo
* Logic is as follows:
* - Fetches the artifact from mvn
* - Untars the artifact
* - Runs `npm link`
*/
async function initNodeDependency(args: CliOptions, dependencyName: string) {
	logger.info(`Setting up ${dependencyName}`);

	const { btvaVersion } = args;

	const natFolder = getNatConfigDir();
	const moduleLocation = join(natFolder, dependencyName);

	logger.debug(`Downloading ${dependencyName}`);
	const artifactLocation = await downloadArtifact(
		{
			artifactid: dependencyName,
			groupid: "com.vmware.pscoe.iac",
			version: btvaVersion,
			type: "tgz"
		},
		natFolder
	);

	logger.debug(`Downloaded ${dependencyName} to ${artifactLocation}`);

	logger.debug(`Decompressing ${dependencyName} to ${moduleLocation}`);
	await untar({
		src: artifactLocation,
		dest: moduleLocation
	});

	logger.debug(`Running npm link for ${dependencyName} located at ${join(moduleLocation, 'package')}`);
	await execa('npm', ['link'], { cwd: join(moduleLocation, 'package') });

	logger.info(`Done setting up ${dependencyName}`);
}

/**
* Will download vrotsc and vropkg to your home directory and npm link them
*/
export async function initDependencies(args: CliOptions) {
	const dependencies = ['vropkg', 'vrotsc', 'vrotest'];

	for (const dependencyName of dependencies) {
		await initNodeDependency(args, dependencyName);
	}
}

/**
* Initializes the config.json file in ~/.nat
* This configuration stores for now just repo data
* TODO: Think about moving all config here ?
*/
export async function initConfiguration(args: CliOptions) {
	const configDir = getNatConfig();
	if (existsSync(configDir)) {
		logger.warn("Config file already exists, skipping. If you wish to reconfigure, please delete the config file and run init again");
		return;
	}

	const repoAnswers = await inquirer.prompt([
		{
			name: "url",
			type: "text",
			message: `What is the maven repository url? (Without trailing '/')`,
		},
		{
			name: "username",
			type: "text",
			message: `What is the username for the repo?`,
		},
		{
			name: "password",
			type: "password",
			message: `What is the password for the repo?`,
		},
		{
			name: "cache",
			type: "boolean",
			message: "Should we cache artifacts? This will significantly improve performance, to no cost.",
			default: true
		},

	]);

	const config = {
		repo: repoAnswers
	};

	writeFileSync(configDir, JSON.stringify(config));
}
