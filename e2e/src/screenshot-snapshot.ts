import * as path from 'path';
import {browser} from 'protractor';
import * as fs from 'fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

export async function takeScreenshot(filename): Promise<void> {
  await new Promise(resolve => browser.takeScreenshot().then(data => {
    const stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end(resolve);
  }));
}

function getSnapshotPaths(testName: string) {
  const getPath = (extension) => path.resolve(__dirname, `../screenshots/${testName}.${extension}.png`);
  const actualFile = getPath('actual');
  const expectedFile = getPath('expected');
  const diffFile = getPath('diff');
  return {actualFile, expectedFile, diffFile};
}

function readPNG(filePath): Promise<PNG> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (readError, bytes) => {
        if (readError) {
          return reject(readError);
        }

        new PNG().parse(bytes, (error, png) => {
          if (error) {
            return reject(error);
          }
          resolve(png);
        });
      }
    );
  });
}

function writePNG(filePath: string, png: PNG): void {
  png.pack().pipe(fs.createWriteStream(filePath));
}

export async function getSnapshotDiff(testName: string) {
  const {actualFile, expectedFile, diffFile} = getSnapshotPaths(testName);

  await takeScreenshot(actualFile);

  const actual = await readPNG(actualFile);
  const expected = await readPNG(expectedFile);

  const {width, height} = expected;
  const diff = new PNG({ width, height });
  const differentPixels = pixelmatch(actual.data, expected.data, diff.data, width, height, {threshold: 0.1});

  writePNG(diffFile, diff);
  return differentPixels;
}

export async function checkSnapshot(testName: string) {
  expect(await getSnapshotDiff(testName)).toEqual(0);
}
