import { existsSync } from "fs";
import { mkdir } from "fs/promises";

/**
* Ensures the  dir is created and ready to be written in
*/
export default async function(dir: string) {
	if (!existsSync(dir))
		await mkdir(dir, { recursive: true });
}
