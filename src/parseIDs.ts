import puppeteer, { Browser, Page } from "puppeteer";
import { readFile, removeFile, writeToFile } from "./fileService";

const delay = (miliseconds: number): Promise<void> =>
  new Promise((resolve: any) => {
    setTimeout(() => {
      resolve();
    }, miliseconds);
  });

export default async function parseIDs(type: string): Promise<boolean> {
  // Бренды техники (select value)
  let manufacturer: string[] = [
    // "11",
    // "5",
    // "63",
    // "62",
    // "53",
    // "7",
    // "54",
    // "57",
    // "59",
    // "6",
    // "58",
    // "60",
    // "14",
    // "1",
    // "49",
    // "50",
    // "66",
    // "2",
    // "8",
    // "48",
    // "9",
    // "69",
    // "61",
    // "3",
    // "51",
    // "4",
  ];

  try {
    const browser: Browser = await puppeteer.launch();
    const page: Page = await browser.newPage();

    await page.goto(`https://general-moto.ru/`);

    await removeFile(`./files/model_id.txt`);

    await page.waitForSelector("#gm > div > form > select");
    await page.select("#gm > div > form > select", type);

    await delay(100);

    for (let i = 0; i < manufacturer.length; i++) {
      await page.waitForSelector("#gm-factories > select");
      await page.select("#gm-factories > select", manufacturer[i]);

      await delay(100);

      const years: string[] = await page.$$eval(
        "#gm-years > select > option",
        (options: any[]) => {
          return options.map((option: any) => {
            return option.innerText;
          });
        }
      );

      for (let j = 0; j < years.length; j++) {
        await page.select("#gm-years > select", years[j]);

        await delay(100);

        const modelsIDs: string[] = await page.evaluate(() =>
          Array.from(
            document.querySelectorAll("#gm-models > select > option")
          ).map((element: any) => element?.value)
        );

        const uniquId: Set<string> = new Set();

        modelsIDs.forEach((id) => uniquId.add(id));
        uniquId.forEach((id) => writeToFile("./files/model_id.txt", id));
      }
    }

    await browser.close();
    console.log(`- - - - parse IDs OK - - - -`);
    return true;
  } catch (err: any) {
    console.log(err);
    return false;
  }
}
