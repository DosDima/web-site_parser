import puppeteer from "puppeteer";
import fs from "node:fs";

const createMachinery = async (id, type, brand, year, model, productIds) => {
  fs.appendFileSync(
    `./files/moto.json`,
    `${id} | ${type} | ${brand} | ${year} | ${model} | ${productIds}\n`
  ),
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.error("file written successfully");
      }
    };
};

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 3000 });

    for (let i = 44600; i < 100000; i++) {
      console.log(`${i}`);

      await page.goto(`https://general-moto.ru/models/?model_id=${i}`);

      const factories = await page.$$eval(
        "#gm-factories > select > option",
        (option) => {
          return option.map((anchor) => anchor.textContent);
        }
      );

      if (factories[0] === "- Производитель -" || !factories[0]) continue;

      const year = await page.$$eval("#gm-years > select", (option) => {
        return option.map((anchor) => {
          return option.map((anchor) => anchor.textContent);
        });
      });

      const model = await page.$$eval(
        "#gm-models > select > option",
        (option) => {
          return option.map((anchor) => anchor.textContent);
        }
      );

      const links = await page.evaluate(() => {
        const selector = `.offers > form > input[name=product_id]`;
        return Array.from(document.querySelectorAll(selector), (e) => e.value);
      });

      const typeDOM = await page.waitForSelector("#page-content > h1");
      const value = await typeDOM.evaluate((el) => el.textContent);

      let type = "мотоцикл";
      
      if (value.includes("мотоцикла")) {
        type = "мотоцикл";
      }

      if (value.includes("квадроцикла")) {
        type = "квадроцикл";
      }

      if (value.includes("скутера")) {
        type = "скутер";
      }
      
      if (value.includes("снегохода")) {
        type = "снегоход";
      }
      
      createMachinery(i, type, factories[0], year[0], model[0], links);

      console.log(`${factories[0]} | ${year[0]} | ${model[0]}`);
    }

    await browser.close();
  } catch (err) {
    console.log(err);
  }
})();
