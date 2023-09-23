#! /usr/bin/env node
import { parse } from 'ts-command-line-args';
import { join } from "path";

import vropkg from "./btva/vropkg.js";
import vrotsc from "./btva/vrotsc.js";
import ensureDirClean from './helpers/fs/ensureDirClean.js';
import { ArtifactData, fetchArtifactData } from './helpers/maven/artifact.js';
import { ensurePackage } from './helpers/maven/mvn.js';
import logger from './logger/logger.js';
import { CliOptions } from './arguments.js';
import { initDependencies } from './init.js';

const args = parse<CliOptions>(
	{
		outFolder: { type: String, defaultValue: "NAT", description: "Where to output the generated `.package` file as well as other build artifacts" },
		clean: { type: Boolean, defaultValue: false, description: "TEMPORARY: Runs `mvn clean package` once to ensure that the target folder exists, so we have dependencies + certificates" },
		help: { type: Boolean, defaultValue: false, alias: "h", description: "Displays Help" },
		init: { type: Boolean, defaultValue: false, description: "Initialize NAT dependencies, downloads vrotsc and vropkg from maven central" },
		btvaVersion: { type: String, defaultValue: "2.35.0", description: "Specifies the btva version we should use when it's needed" }
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

if (args.init) {
	await initDependencies(args);
	logger.info("Successfully set up vrotsc and vropkg, you can now run nat anywhere");
	process.exit(0);
}

// Fetches artifact data, stores it in a lock file and returns it. Alternatively if the lock file exists, fetches it from there
const artifactData: ArtifactData = await fetchArtifactData(cwd);

// Ensures we run mvn clean package if the target dir does not exist.
await ensurePackage(cwd, args.clean);
// Clears out the outDirectory
ensureDirClean(outFolder);
// Runs vrotsc to transpile TS code
await vrotsc(args, artifactData);
// Runs vropkg to create the .package file
await vropkg(args, artifactData);

logger.info(`Elapsed time generating package: ${(Date.now() - start) / 1000}s`);
