class PromiseQueue {
	private queue: Promise<any>[] = [];

	add(promise: Promise<any>) {
		this.queue.push(promise);
	}
}
