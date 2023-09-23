import { existsSync, mkdirSync, rmSync } from "fs";
/**
* Ensures that the nat dir will be clean if it exists.
* If it does not exist, creates it
*/
export default function (dir) {
    if (existsSync(dir))
        rmSync(dir, { recursive: true });
    mkdirSync(dir);
}
