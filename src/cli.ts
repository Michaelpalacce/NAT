import { watch } from "chokidar";
import { parseArguments } from "./arguments.js";
import { initCmd, buildCmd, pushCmd, addConnectionCmd, testCmd, vrotscCmd, vropkgCmd } from "./commands.js";
import { basename, join } from "path";
import logger from "./logger/logger.js";

const debounce = (fn: Function, ms = 5000) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function(this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

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

	if (args.watch) {
		const watcher = watch(join(process.cwd(), "src"), { ignored: /^\./, persistent: true });
		let filesBuffer: string[] = [];

		const callback = debounce(async () => {
			const files = filesBuffer.map(file => basename(file));
			args.files = files.join(',');
			logger.info(`Compiling with filter: ${args.files}`);
			filesBuffer = [];
			try {
				await vrotscCmd(args);
			} catch (e) {
				console.log(e);
			}
		});

		watcher
			.on('add', function(path) {
				// We don't do anything
			})
			.on('change', async function(path) {
				filesBuffer.push(path);
				callback(path);
			})
			.on('unlink', function(path) {
				logger.warn(`File: ${path} has been deleted, currently this is not handled`);
			})
			.on('error', function(error) {
				logger.error(`Error: ${error}`);
			});
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

