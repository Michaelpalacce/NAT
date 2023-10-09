/**
* Debounces the given callback.
* Example:
* ```ts
* const debouncedCallback = debounce((message) => { console.log(message) })
* debouncedCallback("Won't print")
* debouncedCallback("Will print")
* ```
* @returns {Function} The debounced function
*/
export default function debounce(fn: Function, ms: number = 5000): Function {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function(this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
}
