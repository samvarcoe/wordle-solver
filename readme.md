# Wordle Solver

This project uses webdriverio to automate the solving of Wordle puzzles.

To watch it in action:
- Install the project dependencies `npm i`
- Run the program `npm run solve`

The program uses a word list that (supposedly) contains the full word set, including all of the possible answers and valid words. A word is selected at random at each stage and the word list is filtered based on the feedback from the previous guess. I may try to improve the strategy in future but this naive approach seems to work quite well.

I'd like to say thank you to Wordle's creator, Josh Wardle, for providing us all with a fun game to play and experiment with. I hope he doesn't mind that what I've done here.