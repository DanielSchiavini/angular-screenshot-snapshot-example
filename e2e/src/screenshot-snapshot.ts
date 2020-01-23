import * as path from 'path';
import {browser} from 'protractor';
import * as fs from 'fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

export async function takeScreenshot(filename) {
  await new Promise(resolve => browser.takeScreenshot().then(data => {
    const stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end(resolve);
  }));
}

function getPaths(testName: string) {
  const getPath = (extension) => path.resolve(__dirname, `../screenshots/${testName}.${extension}.png`);
  const actualFile = getPath('actual');
  const expectedFile = getPath('expected');
  const diffFile = getPath('diff');
  return {actualFile, expectedFile, diffFile};
}

export async function getSnapshotDiff(testName: string) {
  const {actualFile, expectedFile, diffFile} = getPaths(testName);

  await takeScreenshot(actualFile);

  const img1 = PNG.sync.read(fs.readFileSync(actualFile));
  const img2 = PNG.sync.read(fs.readFileSync(expectedFile));
  const {width, height} = img1;
  const diff = new PNG({ width, height });

  const differentPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});

  fs.writeFileSync(diffFile, PNG.sync.write(diff));
  return differentPixels;
}
