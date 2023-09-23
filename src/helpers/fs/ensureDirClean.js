import { existsSync, mkdirSync, rmSync } from "fs";
export default function (dir) {
    if (existsSync(dir))
        rmSync(dir, { recursive: true });
    else
        mkdirSync(dir);
}
