import { execa } from "execa";
import { ArtifactData } from "../helpers/maven/artifact.js";
import { CliOptions } from "../arguments.js";
import logger from "../logger/logger.js";
import { getCertificates } from "../helpers/fs/locations.js";
import { readFile } from "fs/promises";

/**
* This method runs both vropkg tree and flat. This will package the entire solution to a .package file
*/
export default async function(args: CliOptions, artifactData: ArtifactData) {
	const { outFolder } = args;
	const { artifactId, groupId, version } = artifactData;
	const start = Date.now();
	const password = (await readFile(getCertificates().certPass)).toString();

	logger.info("Running vropkg");

	await execa('vropkg', [
		'--in',
		'js',
		'--srcPath', `${outFolder}/vro-sources/js`,
		'--out', 'tree',
		'--destPath', `${outFolder}/vro-sources/xml`,
		'--privateKeyPEM', getCertificates().privateKeyPem,
		'--certificatesPEM', getCertificates().certPem,
		'--keyPass', password,
		'--version', version,
		'--packaging', 'package',
		'--artifactId', artifactId,
		'--groupId', groupId,
		'--description', args.description,
	]);

	await execa('vropkg', [
		'--in', 'tree',
		'--srcPath', `${outFolder}/vro-sources/xml`,
		'--out', 'flat',
		'--destPath', `${outFolder}/vropkg`,
		'--privateKeyPEM', getCertificates().privateKeyPem,
		'--certificatesPEM', getCertificates().certPem,
		'--keyPass', password,
		'--version', version,
		'--packaging', 'package',
		'--artifactId', artifactId,
		'--groupId', groupId,
		'--description', args.description,
	]);

	logger.info(`Finished running vropkg: Took: ${(Date.now() - start) / 1000}s`);
}
