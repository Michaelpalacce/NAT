import inquirer from "inquirer";
import { readFile, readdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import logger from "../../logger/logger.js";
import ensureDirExists from "../../helpers/fs/ensureDirExists.js";
import { getConnectionsDir } from "../../helpers/fs/locations.js";
import { Connection } from "./connection.js";
import questions from "./questions.js";

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
