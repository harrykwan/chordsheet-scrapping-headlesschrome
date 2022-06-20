const serverless = require("serverless-http");
const express = require("express");
const chromium = require("chrome-aws-lambda");
const app = express();

async function getpage_91pu(url) {
  let browser = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();
    // await page.setUserAgent(
    //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4668.0 Safari/537.36"
    // );
    console.log(url);
    await page.goto(url);
    const pageresult = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        let mychecker = setInterval(() => {
          try {
            const alllines = document
              .getElementsByClassName("tone")[0]
              .getElementsByTagName("p");
            let result = [];
            for (var j = 0; j < alllines.length; j++)
              result.push({
                body: alllines[j].innerText,
                type:
                  alllines[j].className.indexOf("lyric") != -1
                    ? "lyric"
                    : "chord",
              });
            resolve({
              result: result,
            });
            clearInterval(mychecker);
          } catch (e) {
            console.log(e);
          }
        }, 100);
      });
    });
    await browser.close();
    return pageresult;
  } catch (error) {
    return "puppeteer error: " + error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/test", (req, res, next) => {
  return res.status(200).json({
    url: req.query.url,
  });
});

app.get("/getpage", async (req, res, next) => {
  try {
    let result = [];
    if (req.query.url.indexOf("91pu.com") != -1) {
      result = await getpage_91pu(req.query.url);
    }
    return res.status(200).json({
      body: result,
    });
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      error: e,
    });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
