import inquirer, { InputQuestion } from "inquirer";
import { readFile, readdir, rm, writeFile } from "fs/promises";
import { getConnectionsDir } from "../helpers/fs/locations.js";
import { join } from "path";
import { existsSync } from "fs";
import logger from "../logger/logger.js";
import ensureDirExists from "../helpers/fs/ensureDirExists.js";
import { DEFAULT_CONNECTION_NAME } from "../arguments.js";

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
		default: DEFAULT_CONNECTION_NAME
	},
	{
		name: "url",
		type: "input",
		message: "FQDN : ",
		default: "vra-l-01a.corp.local"
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
export function hasConnection(connectionName: string): boolean {
	return existsSync(getConnectionPath(connectionName));
}

/**
* Gets all the stored connections
*/
export async function getConnections(): Promise<string[]> {
	return (await readdir(getConnectionsDir())).map(c => c.substring(0, c.length - 5));
}

/**
* Deletes the given connection if it exists
*/
export async function deleteConnection(connectionName: string): Promise<void> {
	if (hasConnection(connectionName))
		await rm(getConnectionPath(connectionName), { recursive: true });
}

export async function getConnection(connectionName: string): Promise<Connection> {
	if (hasConnection(connectionName))
		return JSON.parse((await readFile(getConnectionPath(connectionName))).toString());

	throw new Error(`Connection ${connectionName} does not exist. Possible connections: ${(await getConnections()).join(',')}`);
}

/**
* This will prompt you for the connection details and save it given the name.
* If you already have one called the same name, it will be overwritten
*/
export async function addConnection(): Promise<void> {
	const answer = await inquirer.prompt(questions);
	await ensureDirExists(getConnectionsDir());
	await deleteConnection(answer.name);
	await writeFile(getConnectionPath(answer.name), JSON.stringify(answer, null, 4));
	logger.debug(`Connection (${answer.name}) successfully added`);
}
