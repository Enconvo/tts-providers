import * as crypto from "crypto";
import * as fs from "fs";

export namespace MD5Util {

    export function getMd5(text: string): string {
        const hash = crypto.createHash("md5");
        hash.update(text);
        return hash.digest("hex");
    }
    export function getMd4(text: string): string {
        const hash = crypto.createHash("md5");
        hash.update(text);
        return hash.digest("hex");
    }

    export function getFileMd5(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash("md5");
            const stream = fs.createReadStream(filePath);

            stream.on("data", (data: Buffer) => {
                hash.update(data);
            });

            stream.on("end", () => {
                resolve(hash.digest("hex"));
            });

            stream.on("error", (error: NodeJS.ErrnoException) => {
                reject(error);
            });
        });
    }
}
