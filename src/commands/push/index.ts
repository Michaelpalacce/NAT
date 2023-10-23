import { CliOptions } from "../../arguments.js";
import axios from "axios";
import LoginClient from "../../clients/aria/LoginClient.js";
import FormData from 'form-data';
import { createReadStream } from "fs";
import logger from "../../logger/logger.js";
import { ArtifactData, fetchArtifactData, getPackageNameFromArtifactData } from "../../helpers/maven/artifact.js";
import { join } from "path";

export default async function(args: CliOptions) {
	logger.warn("Pushing is still in Beta, currently errors while importing are not really handled, you won't get a good message.");
	const loginClient = await LoginClient.fromConnection(args.connection);
	loginClient.setLoginInterceptorInInstance();

	const artifactData: ArtifactData = await fetchArtifactData(process.cwd());

	// Create a new form instance
	const form = new FormData();

	// TESTING
	const packageName = getPackageNameFromArtifactData(artifactData);
	const location = join(process.cwd(), args.outFolder, 'vropkg', packageName);

	form.append('file', createReadStream(location), packageName);
	form.append('overwrite', 'true');
	form.append('tagImportMode', 'ImportAndOverwriteExistingValue');
	form.append('importConfigurationAttributeValues', 'false');
	form.append('importConfigSecureStringAttributeValues', 'false');

	logger.debug(`Going to upload: ${location}`);

	const url = `https://${loginClient.getConfig().getUrl()}/vco/api/packages`;
	const response = await axios.post(url, form, { headers: form.getHeaders() }).catch(e => e);
	logger.info(response.data);
	logger.info(`${packageName} uploaded`);
}
