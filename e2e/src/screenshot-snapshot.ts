import * as path from 'path';
import {browser} from 'protractor';
import * as fs from 'fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * Takes a screenshot of the current browser window and saves it to the given location.
 * @param filename The name of the file to write the screenshot to.
 */
export async function takeScreenshot(filename): Promise<void> {
  await new Promise(resolve => browser.takeScreenshot().then(data => {
    const stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end(resolve);
  }));
}

/**
 * Gets the paths to the actual, expected and diff files for a test with the given name.
 * @param testName The name of the test.
 */
function getSnapshotPaths(testName: string) {
  const getPath = (extension) => path.resolve(__dirname, `../screenshots/${testName}.${extension}.png`);
  const actualFile = getPath('actual');
  const expectedFile = getPath('expected');
  const diffFile = getPath('diff');
  return {actualFile, expectedFile, diffFile};
}

/**
 * Parses the given buffer into a new PNG object.
 * @param buffer The buffer to read.
 * @return A promise of a PNG.
 */
function parsePNG(buffer: Buffer): Promise<PNG> {
  return new Promise<PNG>((resolve, reject) => {
    new PNG().parse(buffer, (error, png) => {
      if (error) {
        return reject(error);
      }
      resolve(png);
    });
  });
}

/**
 * Reads the given file into a PNG object.
 * @param filePath The path to the file.
 * @return A promise of a PNG.
 */
function readPNG(filePath: string): Promise<PNG> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (readError, buffer) => {
        if (readError) {
          return reject(readError);
        }
        parsePNG(buffer).then(resolve, reject);
      }
    );
  });
}

/**
 * Writes a PNG file to the given path.
 * @param filePath The path to the file to be written.
 * @param png The png object.
 */
function writePNG(filePath: string, png: PNG): void {
  png.pack().pipe(fs.createWriteStream(filePath));
}

/**
 * Calculates the number of pixels difference between a saved snapshot file and a new screenshot.
 * @param testName Name of the test, used to calculate the path to the expected file and to write actual and diff files.
 * @return A promise of the number of pixels difference.
 */
export async function getSnapshotDiff(testName: string): Promise<number> {
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

/**
 * Checks that the snapshot matches, raising an assertion error otherwise.
 * This can be extended to automatically save snapshots when required.
 * @param testName Name of the test, used to calculate the path to the expected file and to write actual and diff files.
 */
export async function checkSnapshot(testName: string) {
  expect(await getSnapshotDiff(testName)).toEqual(0);
}
