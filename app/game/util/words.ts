import fs from 'fs';
import path from 'path';

const basePath = path.join(__dirname, './wordfiles/');

function wordsFromFile(source: string = 'standard'): string[] {
  const safeSuffix = path.normalize(source).replace(/^(\.\.(\/|\\|$))+/, '');
  const filepath = path.join(basePath, safeSuffix);
  if (!fs.existsSync(filepath)) {
    throw new Error('Provided wordlist is not a valid option');
  }

  const stats = fs.statSync(filepath);
  if (!stats.isFile()) {
    throw new Error('Provided wordlist is not a valid option');
  }

  const contents = fs.readFileSync(filepath, 'utf8');
  const words = contents.trim().toLowerCase().split(/\r?\n/);
  return words;
}

export default wordsFromFile;
