import { createReadStream, readdirSync } from "fs";
import { join } from "path";
import { CliOptions } from "../../arguments.js";
import LoginClient from "../../clients/aria/LoginClient.js";
import OrchestratorClient from "../../clients/aria/OrchestratorClient.js";
import logger from "../../logger/logger.js";
import { fetchProjectArtifactData, getPackageNameFromArtifactData } from "../../helpers/maven/artifact.js";

/*
* Pushes the prepared package to Aria Orchestrator
* @TODO: PUSH DEPS :)
*/
export default async function(args: CliOptions) {
	logger.warn("Pushing is still in Beta, currently errors while importing are not really handled, you won't get a good message.");

	const loginClient = await LoginClient.fromConnection(args.connection);
	loginClient.setLoginInterceptorInInstance();

	const packageName = getPackageNameFromArtifactData(await fetchProjectArtifactData(process.cwd()));
	const location = join(process.cwd(), args.outFolder, 'vropkg', packageName);

	const orchestratorClient = new OrchestratorClient(loginClient.getConfig());
	const response = await orchestratorClient.importPackage(packageName, createReadStream(location));

	logger.info(`${packageName} uploaded`);
	logger.info(`Status Code: ${response.status}`);
	logger.info(response.data);

	const dependenciesPath = join(process.cwd(), args.outFolder, 'dependency');

	const depContents = readdirSync(dependenciesPath);
	for (const item of depContents) {
		const itemPath = join(dependenciesPath, item);

		const response = await orchestratorClient.importPackage(item, createReadStream(itemPath));

		logger.info(`${packageName} uploaded`);
		logger.info(`Status Code: ${response.status}`);
		logger.info(response.data);
	}

}
