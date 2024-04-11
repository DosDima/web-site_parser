import fs from "node:fs";
import readline from "readline";

export const writeToFile = async (
  filePath: string,
  content: string
): Promise<boolean> => {
  try {
    fs.appendFileSync(filePath, content + "\n");
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const readFile = async (filePath: string): Promise<Array<string>> => {
  try {
    const result: string[] = [];
    const fileStream: fs.ReadStream = fs.createReadStream(filePath);

    const rl: readline.Interface = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      result.push(line);
    }

    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const removeFile = async (filePath: string): Promise<void> => {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
  }
};
