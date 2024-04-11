import puppeteer, { Browser, HTTPResponse, Page } from "puppeteer";
import { readFile, removeFile, writeToFile } from "./fileService";

async function associateIDandArticle(): Promise<boolean> {
  try {
    const modelList: string[] = await readFile("./files/models.txt");
    const productList: string[] = await readFile("./files/products.txt");

    const associateDictionary = new Map();

    for (let i = 0; i < productList.length; i++) {
      const arr = productList[i].split("|");
      if (arr.length !== 4) continue;
      associateDictionary.set(arr[0].trim(), arr[1].trim());
    }

    let articles: string;

    for (let i = 0; i < modelList.length; i++) {
      const idList: string[] = modelList[i].split("|")[4].split(",");
      articles = "0,";
      for (let j = 0; j < idList.length; j++) {
        if (associateDictionary.has(idList[j])) {
          articles = `${articles},${associateDictionary.get(idList[j])}`;
        }
      }
      modelList[i] = `${modelList[i]}|${articles}|`;
      await writeToFile("./files/parsing_result.txt", modelList[i]);
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export default async function parseProsucts(): Promise<boolean> {
  try {
    const browser: Browser = await puppeteer.launch();
    const page: Page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const linkList: string[] = await readFile("./files/links.txt");

    await removeFile(`./files/products.txt`);

    for (let i = 0; i < linkList.length; i++) {
      const status: HTTPResponse = await page.goto(linkList[i]);


      console.log(
        status.status(),
        ` progress: ${Math.floor((100 / linkList.length) * i)}%`
      );

      if (!status.ok()) continue;

      const id: string = await page
        .$eval(
          "#cart-form > div.purchase > div > input[name=product_id]",
          (el: HTMLInputElement) => el.value
        )
        .then((val: string) => val)
        .catch((err) => {
          console.log(err);
          return `0`;
        });

      const title: string = await page
        .$eval("h1 > span", (el: HTMLElement) => el.innerHTML)
        .then((val: string) => val)
        .catch((err) => {
          console.log(err);
          return `null`;
        });

      const article: string = await page
        .$eval(".hint", (el: HTMLElement) => el.innerHTML)
        .then((val: string) => val)
        .catch((err) => {
          console.log(err);
          return `null`;
        });

      await writeToFile(`./files/products.txt`, `${id}|${article}|${title}|`);
    }

    await associateIDandArticle();

    await browser.close();
    console.log(`- - - - parse prosucts OK - - - -`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
