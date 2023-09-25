#! /usr/bin/env node
import axios from "axios";
import { parseArguments } from "./arguments.js";
import LoginClient from "./clients/aria/LoginClient.js";
import { initCmd, buildCmd } from "./commands.js";
import { addConnection, getConnections } from "./nat/connection.js";
import { join } from "path";
import FormData from 'form-data';
import { createReadStream } from "fs";
import { ArtifactData, fetchArtifactData } from "./helpers/maven/artifact.js";
import logger from "./logger/logger.js";
import inquirer from "inquirer";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const start = Date.now();

const args = parseArguments();

if (args.init) {
	await initCmd(args);
}

if (args.addConnection) {
	await addConnection(args);
}

if (args.build) {
	await buildCmd(args);
}

if (args.push) {
	//WIP
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

	const loginClient = await LoginClient.fromConnection(answers.connection);
	loginClient.setLoginInterceptorInInstance();

	const artifactData: ArtifactData = await fetchArtifactData(process.cwd());

	// Create a new form instance
	const form = new FormData();

	// TESTING :) 
	const packageName = `${artifactData.groupId}.${artifactData.artifactId}-${artifactData.version}.package`;
	const location = join(process.cwd(), args.outFolder, 'vropkg', packageName);
	form.append('file', createReadStream(location), packageName);
	logger.debug(`Going to upload: ${location}`);
	const response = await axios.post('https://vra-l-01a.corp.local/vco/api/packages?overwrite=true', form, { headers: form.getHeaders() }).catch(e => e);
	console.log(response.data);
	logger.info(`${packageName} uploaded`);
	logger.info(`Total time: ${(Date.now() - start) / 1000}s`);
}
