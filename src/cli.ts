import { watch } from "chokidar";
import { parseArguments } from "./arguments.js";
import { initCmd, buildCmd, pushCmd, addConnectionCmd, testCmd, vrotscCmd, vropkgCmd, cleanCmd } from "./commands.js";
import { basename, join } from "path";
import logger from "./logger/logger.js";
import debounce from "./helpers/debounce.js";

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

	if (args.clean) {
		await cleanCmd(args);
	}

	// NO QUEUES FOR NOW, DON'T USE
	if (args.watch) {
		const watcher = watch(join(process.cwd(), "src"), { ignored: /^\./, persistent: true });
		let filesBuffer: string[] = [];

		const onChangeCallback = debounce(async () => {
			const files = filesBuffer.map(file => basename(file));
			args.files = files.join(',');
			logger.info(`Compiling with filter: ${args.files}`);
			filesBuffer = [];
			try {
				await vrotscCmd(args);
				args.files = "";
			} catch (e) {
				console.log((e as any).message);
			}
		});

		watcher
			.on('add', function(path) {
				// We don't do anything
			})
			.on('change', async function(path) {
				filesBuffer.push(path);
				onChangeCallback(path);
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

