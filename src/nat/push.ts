import { CliOptions } from "../arguments.js";
import axios from "axios";
import LoginClient from "../clients/aria/LoginClient.js";
import FormData from 'form-data';
import { createReadStream } from "fs";
import inquirer from "inquirer";
import { getConnections, hasConnection } from "./connection.js";
import logger from "../logger/logger.js";
import { ArtifactData, fetchArtifactData } from "../helpers/maven/artifact.js";

export default async function(args: CliOptions) {
	//WIP
	let connection = args.connection;
	const connectionExists = hasConnection(connection);
	if (!connection || !connectionExists) {
		logger.info("No connection specified, prompting.");
		const connections = await getConnections();

		if (connections.length === 0) {
			throw new Error("Trying to push to Aria Orhcestrator, but no connections have been added. Run `nat --addConnection` first");
		}

		const answers = await inquirer.prompt([
			{
				name: "connection",
				type: "list",
				message: "Connection To Use: ",
				choices: connections,
				default: connections[0]
			}
		]);

		connection = answers.connection;
	}

	const loginClient = await LoginClient.fromConnection(connection);
	loginClient.setLoginInterceptorInInstance();

	const artifactData: ArtifactData = await fetchArtifactData(process.cwd());

	// Create a new form instance
	const form = new FormData();

	// TESTING :) 
	const packageName = `${artifactData.groupId}.${artifactData.artifactId}-${artifactData.version}.package`;
	const location = join(process.cwd(), args.outFolder, 'vropkg', packageName);
	form.append('file', createReadStream(location), packageName);
	logger.debug(`Going to upload: ${location}`);
	const response = await axios.post(`https://${loginClient.getConfig().getUrl()}/vco/api/packages?overwrite=true`, form, { headers: form.getHeaders() }).catch(e => e);
	console.log(response.data);
	logger.info(`${packageName} uploaded`);
}
