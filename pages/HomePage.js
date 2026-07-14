class HomePage {
  constructor(page) {
    this.page = page;
    this.url = 'https://beeceptor.com';
  }

  async open() {
    await this.page.goto(this.url);
  }

  async verifyHomePageOpened() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = { HomePage };