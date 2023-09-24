#! /usr/bin/env node
import { parseArguments } from "./arguments.js";
import { initCmd, packageCmd } from "./commands.js";

const args = parseArguments();

if (args.init) {
	await initCmd(args);
	process.exit(0);
}

if (args.package) {
	await packageCmd(args);
}

if (args.push) {
	//@TODO Implement Me
}
