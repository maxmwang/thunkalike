import stringSim from 'string-similarity';

import wordsFromFile from './util/words';

class WordManager {
  /**
   * The Word.
   */
  word!: string;

  /**
   * The list of unused words.
   */
  words: string[];

  private source: string;

  private answerProximity: number;

  constructor(source: string, answerProximity: number) {
    this.source = source;
    this.answerProximity = answerProximity;

    this.words = wordsFromFile(this.source);
    this.updateWord();
  }

  updateWord() {
    if (this.words.length === 0) {
      this.words = wordsFromFile(this.source);
    }
    const index = Math.floor(Math.random() * this.words.length);
    this.word = this.words[index];
    this.words.splice(index, 1);
  }

  wordsMatch(w1: string, w2: string) {
    w1 = w1.toLowerCase().trim();
    w2 = w2.toLowerCase().trim();

    if (w1 === '' || w2 === '') {
      return false;
    }

    // Words are the same if they are 90% similar
    return stringSim.compareTwoStrings(w1, w2) > this.answerProximity;
  }
}

export default WordManager;
