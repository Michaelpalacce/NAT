#! /usr/bin/env node
import { parse } from 'ts-command-line-args';
import { join } from "path";

import vropkg from "./btva/vropkg.js";
import vrotsc from "./btva/vrotsc.js";
import ensureDirClean from './helpers/fs/ensureDirClean.js';
import { ArtifactData, fetchArtifactData } from './helpers/maven/artifact.js';
import logger from './logger/logger.js';
import { CliOptions } from './arguments.js';
import { initCertificates, initDependencies, resetNatFolder } from './init.js';
import { getHomedir, getSettingsXmlLocation } from './helpers/fs/locations.js';

const args = parse<CliOptions>(
	{
		outFolder: { type: String, defaultValue: "NAT", description: "Where to output the generated `.package` file as well as other build artifacts. Default: NAT" },

		help: { type: Boolean, defaultValue: false, alias: "h", description: "Displays Help" },

		init: { type: Boolean, defaultValue: false, description: "Initialize NAT dependencies, downloads vrotsc and vropkg from maven central" },
		keystoreLocation: { type: String, defaultValue: join(getHomedir(), ".m2", "keystore"), description: "Init: Holds the location to the keystore folder. Must contain a cert.pem and a private_key.pem. Default: ~/.m2/keystore" },

		btvaVersion: { type: String, defaultValue: "2.35.0", description: "TEMPORARY: Specifies the btva version we should use when it's needed" },
		clean: { type: Boolean, defaultValue: false, description: "TEMPORARY: Runs `mvn clean package` once to ensure that the target folder exists, so we have dependencies + type definitions" }
	},
	{
		helpArg: 'help',
		headerContentSections: [{ header: 'NodeJS Aria Tools', content: 'If it breaks, blame Stefan Genov' }],
		footerContentSections: [{ header: 'License', content: `Copyright: WIP` }],
	}
);

const start = Date.now();
const cwd = process.cwd();

const outFolder = join(cwd, args.outFolder);

switch (true) {
	case args.init:
		logger.info("Initializing NAT");
		await resetNatFolder();
		await initDependencies(args);
		await initCertificates(args);
		logger.info("Successfully initialized");
		process.exit(0);
}

// Fetches artifact data, stores it in a lock file and returns it. Alternatively if the lock file exists, fetches it from there
const artifactData: ArtifactData = await fetchArtifactData(cwd);
// Clears out the outDirectory
ensureDirClean(outFolder);
// Runs vrotsc to transpile TS code
await vrotsc(args, artifactData);
// Runs vropkg to create the .package file
await vropkg(args, artifactData);

logger.info(`Elapsed time generating package: ${(Date.now() - start) / 1000}s`);
