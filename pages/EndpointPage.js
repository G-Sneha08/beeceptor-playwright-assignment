class EndpointPage {
  constructor(page, demoPauseMs = 0) {
    this.page = page;
    this.demoPauseMs = demoPauseMs;

    this.acceptCookiesButton = page.getByRole('button', {
      name: 'Accept',
      exact: true,
    });

    this.mockRulesButton = page
      .getByText(/^Mock Rules \(\d+\)$/, {
        exact: true,
      })
      .first();

    this.newRuleButtonGroup = page
      .locator('.btn-group')
      .filter({
        hasText: 'New Rule',
      })
      .first();

    this.newRuleDropdownButton =
      this.newRuleButtonGroup.locator(
        'button.dropdown-toggle'
      );

    this.newCalloutRuleOption = page.getByText(
      'New Callout Rule',
      {
        exact: true,
      }
    );

    this.matchValueInput = page
      .locator(
        'input.form-control:visible' +
          ':not(#targetEndpoint)' +
          ':not([placeholder="Description"])'
      )
      .first();

    this.targetEndpointInput = page
      .locator('input#targetEndpoint:visible')
      .first();

    this.ruleDescriptionInput = page
      .locator(
        'input[placeholder="Description"]:visible'
      )
      .first();

    this.saveButton = page
      .locator('button:visible')
      .filter({
        hasText: /^Save$/,
      })
      .last();
  }

  async pause(milliseconds = this.demoPauseMs) {
    if (milliseconds > 0) {
      await this.page.waitForTimeout(milliseconds);
    }
  }

  async showStep(message, duration = 1800) {
    await this.page.evaluate((text) => {
      const existing = document.getElementById(
        'playwright-demo-message'
      );

      if (existing) {
        existing.remove();
      }

      const banner = document.createElement('div');
      banner.id = 'playwright-demo-message';
      banner.textContent = text;

      Object.assign(banner.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '999999',
        background: '#111827',
        color: '#ffffff',
        border: '3px solid #ef4444',
        borderRadius: '12px',
        padding: '14px 24px',
        fontSize: '20px',
        fontWeight: '700',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        maxWidth: '80%',
        textAlign: 'center',
      });

      document.body.appendChild(banner);
    }, message);

    await this.pause(duration);

    await this.page.evaluate(() => {
      document
        .getElementById('playwright-demo-message')
        ?.remove();
    });
  }

  async highlight(locator, duration = 900) {
    await locator.scrollIntoViewIfNeeded();

    await locator.evaluate((element) => {
      element.dataset.originalOutline =
        element.style.outline || '';

      element.dataset.originalBackground =
        element.style.backgroundColor || '';

      element.dataset.originalBoxShadow =
        element.style.boxShadow || '';

      element.style.outline = '4px solid #ef4444';
      element.style.outlineOffset = '3px';
      element.style.backgroundColor = '#fef3c7';
      element.style.boxShadow =
        '0 0 0 6px rgba(239, 68, 68, 0.25)';
      element.style.transition = 'all 0.2s ease';
    });

    await this.pause(duration);

    await locator.evaluate((element) => {
      element.style.outline =
        element.dataset.originalOutline || '';

      element.style.backgroundColor =
        element.dataset.originalBackground || '';

      element.style.boxShadow =
        element.dataset.originalBoxShadow || '';

      element.style.outlineOffset = '';
    });
  }

  async highlightAndClick(
    locator,
    {
      label,
      beforeClickPause = 700,
      afterClickPause = 1200,
      force = false,
    } = {}
  ) {
    if (label) {
      await this.showStep(label, 1100);
    }

    await locator.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await locator.scrollIntoViewIfNeeded();
    await locator.hover();
    await this.pause(beforeClickPause);

    await this.highlight(locator, 900);

    await locator.click({
      force,
    });

    await this.pause(afterClickPause);
  }

  async highlightAndFill(
    locator,
    value,
    label
  ) {
    if (label) {
      await this.showStep(label, 1000);
    }

    await locator.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await locator.scrollIntoViewIfNeeded();
    await locator.hover();
    await this.pause(500);

    await this.highlight(locator, 700);

    await locator.click();
    await locator.fill('');

    /*
     * Typing character-by-character is easier to see
     * in the demo video than using fill(value).
     */
    await locator.pressSequentially(value, {
      delay: 35,
    });

    await this.pause(900);
  }

  async acceptCookiesIfVisible() {
    const isVisible = await this.acceptCookiesButton
      .isVisible()
      .catch(() => false);

    if (isVisible) {
      await this.highlightAndClick(
        this.acceptCookiesButton,
        {
          label: 'Accepting the cookie notification',
          afterClickPause: 800,
        }
      );
    }
  }

  async openMockRules() {
    await this.acceptCookiesIfVisible();

    await this.highlightAndClick(
      this.mockRulesButton,
      {
        label: 'Opening Beeceptor Mock Rules',
        afterClickPause: 1500,
      }
    );
  }

  async openNewCalloutRule() {
    await this.highlightAndClick(
      this.newRuleDropdownButton,
      {
        label: 'Opening the New Rule menu',
        afterClickPause: 900,
      }
    );

    await this.highlightAndClick(
      this.newCalloutRuleOption,
      {
        label: 'Selecting New Callout Rule',
        afterClickPause: 1600,
      }
    );

    await this.targetEndpointInput.waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  async fillCalloutRule({
    matchPath,
    targetUrl,
    description,
  }) {
    await this.highlightAndFill(
      this.matchValueInput,
      matchPath,
      'Entering the API path that triggers the callout'
    );

    await this.highlightAndFill(
      this.targetEndpointInput,
      targetUrl,
      'Entering the Webhook.site target URL'
    );

    await this.highlightAndFill(
      this.ruleDescriptionInput,
      description,
      'Adding a unique description for this test rule'
    );
  }

  async saveRule() {
    await this.highlightAndClick(
      this.saveButton,
      {
        label: 'Saving the HTTP Callout rule',
        afterClickPause: 2200,
      }
    );
  }

  async verifyRuleExists(description) {
    const descriptionText = this.page.getByText(
      description,
      {
        exact: true,
      }
    );

    if (
      !(await descriptionText
        .isVisible()
        .catch(() => false))
    ) {
      await this.openMockRules();
    }

    await descriptionText.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await this.showStep(
      'The HTTP Callout rule was created successfully',
      1600
    );

    await this.highlight(descriptionText, 1100);
  }

  async deleteRule(description) {
    const descriptionText = this.page.getByText(
      description,
      {
        exact: true,
      }
    );

    if (
      !(await descriptionText
        .isVisible()
        .catch(() => false))
    ) {
      await this.openMockRules();
    }

    await descriptionText.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await this.showStep(
      'Cleaning up the temporary test rule',
      1400
    );

    await this.highlight(descriptionText, 900);

    const ruleRow = descriptionText.locator(
      'xpath=ancestor::div[' +
        './/button or .//a or .//*[@role="button"]' +
        '][1]'
    );

    const semanticDeleteControls =
      ruleRow.locator(
        [
          'button[title*="delete" i]:visible',
          'a[title*="delete" i]:visible',
          '[role="button"][title*="delete" i]:visible',

          'button[aria-label*="delete" i]:visible',
          'a[aria-label*="delete" i]:visible',
          '[role="button"][aria-label*="delete" i]:visible',

          '[data-bs-original-title*="delete" i]:visible',
          '[data-original-title*="delete" i]:visible',

          'button[title*="trash" i]:visible',
          'a[title*="trash" i]:visible',
          '[class*="trash" i]:visible',
        ].join(', ')
      );

    let deleteControl;

    if (
      (await semanticDeleteControls.count()) > 0
    ) {
      deleteControl =
        semanticDeleteControls.first();
    } else {
      const visibleActions = ruleRow.locator(
        [
          'button:visible',
          'a:visible',
          '[role="button"]:visible',
          '[data-bs-toggle="tooltip"]:visible',
        ].join(', ')
      );

      const actionCount =
        await visibleActions.count();

      if (actionCount === 0) {
        throw new Error(
          `No visible delete control found for rule: ${description}`
        );
      }

      deleteControl =
        visibleActions.last();
    }

    this.page.once(
      'dialog',
      async (dialog) => {
        await dialog.accept();
      }
    );

    await this.highlightAndClick(
      deleteControl,
      {
        label: 'Clicking the delete control',
        force: true,
        afterClickPause: 1300,
      }
    );

    const confirmationButton = this.page
      .locator('button:visible')
      .filter({
        hasText: /^(Delete|Confirm|Yes)$/i,
      })
      .first();

    if (
      await confirmationButton
        .isVisible()
        .catch(() => false)
    ) {
      await this.highlightAndClick(
        confirmationButton,
        {
          label: 'Confirming rule deletion',
          afterClickPause: 1300,
        }
      );
    }

    await descriptionText
      .waitFor({
        state: 'detached',
        timeout: 15000,
      })
      .catch(async () => {
        await descriptionText.waitFor({
          state: 'hidden',
          timeout: 15000,
        });
      });

    await this.showStep(
      'Cleanup completed — temporary rule deleted',
      1700
    );
  }
}

module.exports = { EndpointPage };