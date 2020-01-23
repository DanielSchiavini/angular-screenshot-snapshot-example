import { AppPage } from './app.po';
import { browser, logging } from 'protractor';
import {checkSnapshot, getSnapshotDiff} from './screenshot-snapshot';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('snapshots app is running!');
  });

  it('should match the snapshot', async () => {
    await checkSnapshot('example');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
