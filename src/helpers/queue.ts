import logger from "../logger/logger.js";

export class PromiseQueue {
	private queue: Promise<any>[] = [];
	private running: boolean = false;

	add(promise: Promise<any>) {
		this.queue.push(promise);
		this.resolve();
	}

	/**
	* Gets the first element from the queue and waits for it to finish. Then runs the next until no more.
	*/
	resolve() {
		if (this.queue.length && !this.running) {
			this.running = true;
			const promise = this.queue.shift();
			if (promise)
				promise.then(() => this.resolve()).catch((e) => {
					logger.warn(`Error while queueing vrotsc: ${e}`);
				}).finally(() => this.running = false);
		}
	}
}
