import { remote } from 'webdriverio';
import wordSet from './word-list.js';

const randomInt = (max) => {
  return Math.floor(Math.random() * max);
};
  
const pickWord = (words) => {
  return words[randomInt(words.length)];
};

const browser = await remote({
  logLevel: 'silent',
  capabilities: {
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: ['--incognito']
    }
  }
});

export default class Wordle {
  homepage = "https://www.powerlanguage.co.uk/wordle/";

  constructor() {
    this.words = wordSet;
    this.guessCount = 1;
    this.solved = false;
    this.newGame();
  }

  newGame = async () => {
    console.log('Starting a new Wordle game!');
    await browser.url(this.homepage);
    await browser.$('>>>.close-icon').click();
  };

  enterCharacter = async (character) => {
    const key = await browser.$(`>>>button[data-key=${character}]`);
    await key.waitForClickable();
    await key.click();
  };

  enterWord = async (word) => {
    for(let i = 0; i < 5; i++) {
      await this.enterCharacter(word[i]);
    }
    await this.enterCharacter("↵");
    await browser.pause(3000);
  };

  deleteWord = async () => {
    const key = await browser.$('>>>button[data-key="←"]');
    for(let i = 0; i < 5; i++) {
      await key.waitForClickable();
      await key.click();
    }
  };

  IsWordValid = async () => {
    const tile = await browser.$(`>>>game-row:nth-of-type(${this.guessCount})`).$('>>>game-tile:nth-of-type(1)');
    const isValid = await tile.getAttribute('evaluation') != null;
    return isValid;
  };

  makeAGuess = async () => {
    const word = pickWord(this.words);
    console.log(`Trying word: ${word}`);
    this.words = this.words.filter((x) => x != word);
    await this.enterWord(word);

    if(!(await this.IsWordValid())) {
      console.log(`${word} is not in the word list`);
      await this.deleteWord();
      await this.makeAGuess();
    }
  };
  
  evaluateLetter = async (j, i) => {
    const element = await browser.$(`>>>game-row:nth-of-type(${j})`).$(`>>>game-tile:nth-of-type(${i + 1})`);
    return {
      "index": i, 
      "letter": await element.getAttribute('letter'),
      "evaluation": await element.getAttribute('evaluation')
    };
  };

  evaluateGuess = async () => {
    const characters = [];

    for(let i = 0; i < 5; i++) {
      characters.push(await this.evaluateLetter(this.guessCount, i));
    }

    const correct = characters.filter((x) => x.evaluation == 'correct');
    if (correct.length == 5) {
      console.log('\nThe wordle has been solved!');
      return true;
    }
    correct.forEach((x) => this.words = this.words.filter((y) => y[x.index] == x.letter));

    const present = characters.filter((x) => x.evaluation == 'present');
    present.forEach((x) => this.words = this.words.filter((y) => y.includes(x.letter)));
    present.forEach((x) => this.words = this.words.filter((y) => y[x.index] != x.letter));
    
    const absent = characters
      .filter((x) => x.evaluation == 'absent')
      .filter((x) => !correct.map((y) => y.letter).includes(x.letter))
      .filter((x) => !present.map((y) => y.letter).includes(x.letter));
    absent.forEach((x) => this.words = this.words.filter((y) => !y.includes(x.letter)));

    return false;    
  };

  solve = async () => {
    while(this.guessCount <= 6 && !this.solved) {
      console.log(`\nGuess number: ${this.guessCount}`);
      console.log(`Potential word choices remaining: ${this.words.length}`);
      await this.makeAGuess();
      this.solved = await this.evaluateGuess();
      this.guessCount += 1;
    }
  };
}