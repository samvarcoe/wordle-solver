import { remote } from 'webdriverio';

const homepage = "https://www.powerlanguage.co.uk/wordle/";

export const solveTodaysWordle = async () => {
  const browser = await remote({
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--incognito']
      }
    }
  });

  await browser.url(homepage);
  await browser.saveScreenshot('./hompage.png');
  await browser.deleteSession();
};