import logger from "../logger/logger.js";

/**
* Async queue that accepts asynchronous callbacks. These callbacks will be queued and called one after another.
* You have the ability to queue more at any time
*/
export class AsyncQueue {
	private queue: Function[] = [];
	private running: boolean = false;

	/**
	* Adds a new callback to the queue. Will start the queue if no items exist
	*/
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
