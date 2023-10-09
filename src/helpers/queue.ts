import logger from "../logger/logger.js";

export class Queue {
	private queue: Function[] = [];
	private running: boolean = false;

	add(callback: Function) {
		this.queue.push(callback);
		this.resolve();
	}

	/**
	* Gets the first element from the queue and waits for it to finish. Then runs the next until no more.
	*/
	async resolve() {
		if (this.queue.length && !this.running) {
			this.running = true;
			const cbToCall = this.queue.shift();
			if (cbToCall) {
				await cbToCall().catch((e) => {
					logger.warn(`Error: ${e}`);
				});
				this.running = false;
				this.resolve();
			}
		}
	}
}
