import { AsyncQueue } from "../../helpers/queue.js";
import { watch } from "chokidar";
import { basename, join } from "path";
import debounce from "../../helpers/debounce.js";
import { CliOptions } from "../../arguments.js";
import logger from "../../logger/logger.js";
import vrotsc from "../../btva/vrotsc.js";
import { fetchProjectArtifactData } from "../../helpers/maven/artifact.js";

/**
* Watches for changes in the `src` folder.
* Will only trigger a vrotsc recompile with a filter on a file change.
*/
export default function(args: CliOptions) {
	const queue = new AsyncQueue();
	const watcher = watch(join(process.cwd(), "src"), { ignored: /^\./, persistent: true });
	let filesBuffer: string[] = [];

	const onChangeCallback = debounce(async () => {
		const files = filesBuffer.map(file => basename(file)).join(",");
		filesBuffer = [];

		queue.add(async () => {
			logger.info(`Compiling with filter: ${files}`);
			await vrotsc(args, await fetchProjectArtifactData(process.cwd()), files);
		});
	}, args.watchMs);

	watcher
		.on('change', async function(path) {
			const fileName = basename(path);
			logger.debug(`CHANGE: ${fileName}`);
			filesBuffer.push(fileName);
			onChangeCallback(fileName);
		})
		.on('add', function(path) {
			// Do nothing :)
		})
		.on('unlink', function(path) { logger.warn(`File: ${path} has been deleted, currently this is not handled, you should recompile with 'nat -b'`); })
		.on('error', function(error) { logger.error(`Error: ${error}`); });
}
