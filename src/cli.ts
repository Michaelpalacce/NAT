import { parseArguments } from "./arguments.js";
import { initCmd, buildCmd, pushCmd, addConnectionCmd, testCmd } from "./commands.js";

/**
* This contains all the CLI handling of NAT
*/
export default async function() {
	const args = parseArguments();

	if (args.init) {
		await initCmd(args);
	}

	if (args.addConnection) {
		await addConnectionCmd(args);
	}

	if (args.build) {
		await buildCmd(args);
	}

	if (args.test) {
		await testCmd(args);
	}

	if (args.push) {
		await pushCmd(args);
	}
}

