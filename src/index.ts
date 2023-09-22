#! /usr/bin/env node
import { join } from "path";
import { ArtifactData, fetchArtifactData } from "./artifact.js";

import vropkg from "./btva/vropkg.js";
import vrotsc from "./btva/vrotsc.js";
import ensureDirClean from "./fs/helpers/ensureDirClean.js";

import { parse } from 'ts-command-line-args';
const args = parse({
	outFolder: { type: String, defaultValue: "NAT" },
});

const start = Date.now();
const cwd = process.cwd();

const outFolder = join(cwd, args.outFolder);
const artifactData: ArtifactData = await fetchArtifactData();

ensureDirClean(outFolder);
vrotsc(outFolder, artifactData);
vropkg(outFolder, artifactData);

console.log(`Elapsed time generating package: ${(Date.now() - start) / 1000}s`);
