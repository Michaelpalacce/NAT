import { parseArguments } from "./arguments.js";
import { initCmd, buildCmd, pushCmd, addConnectionCmd, testCmd, cleanCmd, watchCmd } from "./commands.js";

/**
* This contains all the CLI handling of NAT
*/
export default async function() {
	const args = parseArguments();

	if (args.init)
		await initCmd(args);

	if (args.addConnection)
		await addConnectionCmd(args);

	if (args.clean)
		await cleanCmd(args);

	if (args.build || args.watch)
		await buildCmd(args);

	if (args.watch)
		await watchCmd(args);

	if (args.test)
		await testCmd(args);

	if (args.push)
		await pushCmd(args);
}

