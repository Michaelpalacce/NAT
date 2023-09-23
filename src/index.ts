#! /usr/bin/env node
import { parse } from 'ts-command-line-args';
import { join } from "path";

import vropkg from "./btva/vropkg.js";
import vrotsc from "./btva/vrotsc.js";
import ensureDirClean from './helpers/fs/ensureDirClean.js';
import { ArtifactData, fetchArtifactData } from './helpers/maven/artifact.js';

const args = parse({
	outFolder: { type: String, defaultValue: "NAT" },
});

const start = Date.now();
const cwd = process.cwd();

const outFolder = join(cwd, args.outFolder);
const artifactData: ArtifactData = await fetchArtifactData(join(cwd, 'pom.xml'));

ensureDirClean(outFolder);
vrotsc(outFolder, artifactData);
vropkg(outFolder, artifactData);

console.log(`Elapsed time generating package: ${(Date.now() - start) / 1000}s`);
