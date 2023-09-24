import inquirer, { InputQuestion } from "inquirer";
import { CliOptions } from "../arguments.js";
import { mkdir, readdir, rm, writeFile } from "fs/promises";
import { getConnectionsDir } from "../helpers/fs/locations.js";
import { join } from "path";
import { existsSync } from "fs";
import logger from "../logger/logger.js";
import ensureDirExists from "../helpers/fs/ensureDirExists.js";

export interface Connection {
	name: string,
	url: string,
	port: string,
	username?: string,
	password?: string,
	domain?: string,
	refreshToken?: string;
}

const questions: InputQuestion[] = [
	{
		name: "name",
		type: "input",
		message: "Name connection: ",
		default: "Aria"
	},
	{
		name: "url",
		type: "input",
		message: "FQDN : ",
		default: "vra-l-01.corp.local"
	},
	{
		name: "port",
		type: "input",
		message: "Port: ",
		default: "443"
	},
	{
		name: "username",
		type: "input",
		message: "Username: ",
		default: "configurationadmin"
	},
	{
		name: "password",
		type: "input",
		message: "Password (Optional): ",
		default: "VMware1!"
	},
	{
		name: "domain",
		type: "input",
		message: "Domain: ",
		default: "System Domain"
	},
	{
		name: "refreshToken",
		type: "input",
		message: "Refresh Token (Optional): "
	}
];

/**
* Gets the correctly formatted full connection path
*/
function getConnectionPath(connectionName: string): string {
	return join(getConnectionsDir(), `${connectionName}.json`);
}

/**
* Checks if a connection exists
*/
export function hasConnection(connectionName: string) {
	return existsSync(getConnectionPath(connectionName));
}

/**
* Gets all the stored connections
*/
export async function getConnections() {
	return await readdir(getConnectionsDir());
}

/**
* Deletes the given connection if it exists
*/
export async function deleteConnection(connectionName: string) {
	if (hasConnection(connectionName))
		await rm(getConnectionPath(connectionName), { recursive: true });
}

/**
* This will prompt you for the connection details and save it given the name.
* If you already have one called the same name, it will be overwritten
*/
export async function addConnection(args: CliOptions) {
	logger.info(`Adding a new connection`);
	const answer = await inquirer.prompt(questions);
	await ensureDirExists(getConnectionsDir());
	await deleteConnection(answer.name);
	await writeFile(getConnectionPath(answer.name), JSON.stringify(answer));
	logger.info(`Connection (${answer.name}) successfully added`);
}
