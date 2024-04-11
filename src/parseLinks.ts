import puppeteer, { Browser, Page } from "puppeteer";
import { readFile, removeFile, writeToFile } from "./fileService";

export default async function parseLinks(): Promise<boolean> {
  try {
    const browser: Browser = await puppeteer.launch();
    const page: Page = await browser.newPage();

    const linkSet: Set<string> = new Set();

    const idList: string[] = await readFile("./files/model_id.txt");

    await removeFile(`./files/models.txt`);

    for (let i = 0; i < idList.length; i++) {
      const id = idList[i];

      const status = await page.goto(
        `https://general-moto.ru/models/?model_id=${id}`
      );

      if (status.status() !== 200) continue;

      const manufacturer = await page.$eval(
        "#gm-factories > select > option",
        (el) => el.innerText
      );

      if (manufacturer == "- Производитель -") continue;

      const year: string = await page.$eval(
        "#gm-years > select > option",
        (el) => el.innerText
      );

      const model: string = await page.$eval(
        "#gm-models > select > option",
        (el) => el.innerText
      );

      const productIds: string[] = await page.$$eval(
        "input[name=product_id]",
        (el) => el.map((el) => el.value)
      );

      await writeToFile(
        "./files/models.txt",
        `${id}|${manufacturer}|${year}|${model}|${productIds.join(",")}`
      );

      await page.waitForSelector("div.wrap-info > a");

      const links: string[] = await page.$$eval(
        "div.wrap-info > a",
        (option: HTMLAnchorElement[]) => {
          return option.map((anchor: HTMLAnchorElement) => {
            return anchor.href;
          });
        }
      );

      links.forEach((link) => {
        linkSet.add(link);
      });
    }

    await removeFile(`./files/links.txt`);

    linkSet.forEach((link) => writeToFile("./files/links.txt", link));

    browser.close();
    console.log(`- - - - parse lnks OK - - - -`);
    return true;
  } catch (err: any) {
    console.log(err);
    return false;
  }
}
