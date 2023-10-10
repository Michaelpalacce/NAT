import { watch } from "chokidar";
import { parseArguments } from "./arguments.js";
import { initCmd, buildCmd, pushCmd, addConnectionCmd, testCmd, cleanCmd } from "./commands.js";
import { basename, join } from "path";
import logger from "./logger/logger.js";
import debounce from "./helpers/debounce.js";
import { Queue } from "./helpers/queue.js";
import vrotsc from "./btva/vrotsc.js";
import { fetchArtifactData } from "./helpers/maven/artifact.js";

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

	if (args.build || args.watch) {
		await buildCmd(args);
	}

	if (args.watch) {
		// Init
		const queue = new Queue();
		const watcher = watch(join(process.cwd(), "src"), { ignored: /^\./, persistent: true });
		let filesBuffer: string[] = [];

		const onChangeCallback = debounce(async () => {
			const files = filesBuffer.map(file => basename(file)).join(",");
			filesBuffer = [];

			queue.add(async () => {
				logger.verbose(`Compiling with filter: ${files}`);
				await vrotsc(args, await fetchArtifactData(process.cwd()), files);
			});
		}, args.watchMs);

		watcher
			.on('add', function(path) {
				// We don't do anything
			})
			.on('change', async function(path) {
				const fileName = basename(path);
				logger.debug(`CHANGE: ${fileName}`);
				filesBuffer.push(fileName);
				onChangeCallback(fileName);
			})
			.on('unlink', function(path) { logger.warn(`File: ${path} has been deleted, currently this is not handled`); })
			.on('error', function(error) { logger.error(`Error: ${error}`); });
	}

	if (args.test) {
		await testCmd(args);
	}

	if (args.push) {
		await pushCmd(args);
	}
}

