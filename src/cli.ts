import { parseArguments } from "./arguments.js";
import { initCmd, buildCmd, pushCmd } from "./commands.js";
import logger from "./logger/logger.js";

/**
* This contains all the CLI handling of NAT
*/
export default async function() {
	const start = Date.now();

	const args = parseArguments();

	if (args.init) {
		await initCmd(args);
	}

	if (args.addConnection) {
	}

	if (args.build) {
		await buildCmd(args);
	}

	if (args.push) {
		await pushCmd(args);
	}

	logger.info(`Total time: ${(Date.now() - start) / 1000}s`);
}

