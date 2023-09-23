import { execa } from "execa";
import { ArtifactData } from "../helpers/maven/artifact.js";
import { CliOptions } from "../arguments.js";

/**
* This method runs both vropkg tree and flat. This will package the entire solution to a .package file
* @TODO: Better certificate resolution... at the very least detect the one in the target folder... best case use a file system path?
*/
export default async function(args: CliOptions, artifactData: ArtifactData) {
	const { outFolder } = args;
	const { artifactId, groupId, version } = artifactData;


	console.log("Generating vropkg tree");
	await execa('vropkg', [
		'--in',
		'js',
		'--srcPath', `${outFolder}/vro-sources/js`,
		'--out', 'tree',
		'--destPath', `${outFolder}/vro-sources/xml`,
		'--privateKeyPEM', `target/keystore.example-${args.btvaVersion}/private_key.pem`,
		'--certificatesPEM', `target/keystore.example-${args.btvaVersion}/cert.pem`,
		'--keyPass', 'VMware1!',
		'--version', version,
		'--packaging', 'package',
		'--artifactId', artifactId,
		'--groupId', groupId,
		'--description', 'Generated By NAT ;)',
	]);
	console.log("Done generating vropkg tree");

	console.log("Generating vropkg flat");
	await execa('vropkg', [
		'--in', 'tree',
		'--srcPath', `${outFolder}/vro-sources/xml`,
		'--out', 'flat',
		'--destPath', `${outFolder}/vropkg`,
		'--privateKeyPEM', `target/keystore.example-${args.btvaVersion}/private_key.pem`,
		'--certificatesPEM', `target/keystore.example-${args.btvaVersion}/cert.pem`,
		'--keyPass', 'VMware1!',
		'--version', version,
		'--packaging', 'package',
		'--artifactId', artifactId,
		'--groupId', groupId,
		'--description', 'Generated By NAT ;)',
	]);
	console.log("Done generating vropkg flat");
}
