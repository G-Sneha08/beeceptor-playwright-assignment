const { test, expect } = require('@playwright/test');

const { EndpointPage } = require('../pages/EndpointPage');
const { WebhookClient } = require('../utils/WebhookClient');
const { config } = require('../utils/config');

test.describe('Beeceptor HTTP Callout', () => {
  test(
    'create, trigger, verify and clean up an HTTP Callout rule',
    async ({ page, request, context }) => {
      const runId = Date.now();

      const rulePath = `/playwright-callout-${runId}`;
      const ruleDescription = `Playwright HTTP Callout ${runId}`;
      const triggerUrl = `${config.beeceptorApiUrl}${rulePath}`;

      const endpointPage = new EndpointPage(
        page,
        config.demoPauseMs
      );

      const webhookClient = new WebhookClient(
        request,
        config.webhookTargetUrl
      );

      let ruleCreated = false;
      let triggerPage;
      let webhookPage;

      // Used to ensure that an old Webhook.site request is not accepted.
      const previousWebhookRequestId =
        await webhookClient.getLatestRequestId();

      try {
        /*
         * STEP 1:
         * Open Beeceptor and create a temporary HTTP Callout rule.
         */
        await test.step(
          'Open the reusable Beeceptor endpoint',
          async () => {
            await page.goto(config.beeceptorConsoleUrl, {
              waitUntil: 'domcontentloaded',
            });

            await expect(page).toHaveURL(/gsneha-demo-api/);

            await endpointPage.showStep(
              'Step 1: Reusing the existing Beeceptor endpoint',
              1400
            );
          }
        );

        await test.step(
          'Create and save the HTTP Callout rule',
          async () => {
            await endpointPage.openMockRules();
            await endpointPage.openNewCalloutRule();

            await endpointPage.fillCalloutRule({
              matchPath: rulePath,
              targetUrl: config.webhookTargetUrl,
              description: ruleDescription,
            });

            await expect(
              endpointPage.matchValueInput
            ).toHaveValue(rulePath);

            await expect(
              endpointPage.targetEndpointInput
            ).toHaveValue(config.webhookTargetUrl);

            await expect(
              endpointPage.ruleDescriptionInput
            ).toHaveValue(ruleDescription);

            await endpointPage.saveRule();
            ruleCreated = true;

            await endpointPage.verifyRuleExists(
              ruleDescription
            );
          }
        );

        // Close the Mock Rules popup.
        await page.keyboard.press('Escape');
        await endpointPage.pause(500);

        /*
         * STEP 2:
         * Open the actual Beeceptor trigger URL.
         *
         * This is real evidence. We do not replace the page
         * with a custom page. The browser displays Beeceptor's
         * actual response.
         */
        await test.step(
          'Trigger the real Beeceptor API in a new tab',
          async () => {
            await endpointPage.showStep(
              'Step 2: Opening the real Beeceptor API trigger URL',
              1500
            );

            triggerPage = await context.newPage();

            const triggerResponse = await triggerPage.goto(
              triggerUrl,
              {
                waitUntil: 'domcontentloaded',
              }
            );

            await triggerPage.bringToFront();

            expect(
              triggerResponse,
              'Beeceptor should return an HTTP response'
            ).not.toBeNull();

            const status = triggerResponse.status();

            console.log(`Beeceptor status: ${status}`);
            console.log(`Triggered URL: ${triggerUrl}`);

            expect(
              status,
              'Beeceptor should process the matching request'
            ).toBeLessThan(500);

            /*
             * Add only a small banner.
             * The real Beeceptor response remains visible behind it.
             */
            await showEvidenceBanner(triggerPage, {
              heading: 'Step 2 — Real Beeceptor API Trigger',
              lines: [
                'Method: GET',
                `HTTP Status: ${status}`,
                `URL: ${triggerUrl}`,
                'This request matched the HTTP Callout rule.',
              ],
              success: status < 400,
            });

            await triggerPage.waitForTimeout(3500);

            const visibleResponse = await triggerPage
              .locator('body')
              .innerText()
              .catch(() => '');

            console.log(
              `Beeceptor response: ${visibleResponse.slice(0, 300)}`
            );

            await removeEvidenceBanner(triggerPage);
          }
        );

        /*
         * STEP 3:
         * Programmatically verify that Webhook.site received
         * a new GET request.
         */
        let webhookRequest;

        await test.step(
          'Verify the real outgoing request through Webhook.site API',
          async () => {
            webhookRequest =
              await webhookClient.waitForNewRequest({
                previousRequestId:
                  previousWebhookRequestId,
                expectedMethod: 'GET',
                timeout: 30000,
              });

            expect(webhookRequest).toBeTruthy();
            expect(webhookRequest.method).toBe('GET');

            console.log(
              'HTTP Callout successfully received.'
            );

            console.log(
              `Webhook request ID: ${webhookRequest.uuid}`
            );
          }
        );

        /*
         * Open the real Webhook.site dashboard.
         *
         * The dashboard URL is different from the receiving URL.
         * Opening the dashboard does not replace the verified evidence
         * with a custom HTML page.
         */
        await test.step(
          'Show the real request in the Webhook.site dashboard',
          async () => {
            const webhookToken =
              extractWebhookToken(config.webhookTargetUrl);

            const webhookDashboardUrl =
              `https://webhook.site/#!/view/${webhookToken}`;

            webhookPage = await context.newPage();

            await webhookPage.goto(webhookDashboardUrl, {
              waitUntil: 'domcontentloaded',
            });

            await webhookPage.bringToFront();

            // Give the Webhook.site application time to load the list.
            await webhookPage.waitForTimeout(3000);

            // Refresh once so the newly received call is clearly shown.
            await webhookPage.reload({
              waitUntil: 'domcontentloaded',
            });

            await webhookPage.waitForTimeout(2500);

            await showEvidenceBanner(webhookPage, {
              heading: 'Step 3 — Real Webhook.site Verification',
              lines: [
                'HTTP Callout successfully received',
                `Method: ${webhookRequest.method}`,
                `Request ID: ${webhookRequest.uuid}`,
                'The real Webhook.site dashboard is visible behind this message.',
              ],
              success: true,
            });

            await webhookPage.waitForTimeout(4500);

            await removeEvidenceBanner(webhookPage);
          }
        );
      } finally {
        /*
         * FINAL STEP:
         * Return to Beeceptor and delete the temporary rule.
         * This runs even if verification fails.
         */
        if (ruleCreated) {
          await test.step(
            'Clean up the temporary Beeceptor rule',
            async () => {
              await page.bringToFront();

              await page.goto(config.beeceptorConsoleUrl, {
                waitUntil: 'domcontentloaded',
              });

              await endpointPage.showStep(
                'Final Step: Cleaning up temporary test data',
                1400
              );

              await endpointPage.deleteRule(
                ruleDescription
              );

              console.log(
                'Temporary Beeceptor rule deleted successfully.'
              );
            }
          );
        }

        // Close extra evidence tabs after cleanup.
        if (triggerPage && !triggerPage.isClosed()) {
          await triggerPage.close();
        }

        if (webhookPage && !webhookPage.isClosed()) {
          await webhookPage.close();
        }
      }
    }
  );
});

/**
 * Extracts the UUID token from:
 * https://webhook.site/<token>
 */
function extractWebhookToken(webhookUrl) {
  const parsedUrl = new URL(webhookUrl);

  const token = parsedUrl.pathname
    .split('/')
    .filter(Boolean)[0];

  if (!token) {
    throw new Error(
      'WEBHOOK_TARGET_URL does not contain a valid token.'
    );
  }

  return token;
}

/**
 * Adds a small overlay while preserving the real webpage.
 */
async function showEvidenceBanner(
  page,
  {
    heading,
    lines,
    success,
  }
) {
  await page.evaluate(
    ({ title, messages, isSuccess }) => {
      document
        .getElementById('playwright-evidence-banner')
        ?.remove();

      const banner = document.createElement('section');
      banner.id = 'playwright-evidence-banner';

      Object.assign(banner.style, {
        position: 'fixed',
        top: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '2147483647',
        width: 'min(850px, 86vw)',
        padding: '18px 24px',
        borderRadius: '14px',
        background: 'rgba(17, 24, 39, 0.96)',
        color: '#ffffff',
        border: isSuccess
          ? '3px solid #22c55e'
          : '3px solid #f59e0b',
        boxShadow: '0 14px 45px rgba(0, 0, 0, 0.45)',
        fontFamily: 'Arial, sans-serif',
      });

      const headingElement = document.createElement('h2');
      headingElement.textContent = title;

      Object.assign(headingElement.style, {
        margin: '0 0 10px',
        color: isSuccess ? '#86efac' : '#fde68a',
        fontSize: '23px',
      });

      banner.appendChild(headingElement);

      messages.forEach((message) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = message;

        Object.assign(paragraph.style, {
          margin: '5px 0',
          fontSize: '16px',
          lineHeight: '1.4',
          wordBreak: 'break-word',
        });

        banner.appendChild(paragraph);
      });

      document.body.appendChild(banner);
    },
    {
      title: heading,
      messages: lines,
      isSuccess: success,
    }
  );
}

async function removeEvidenceBanner(page) {
  await page.evaluate(() => {
    document
      .getElementById('playwright-evidence-banner')
      ?.remove();
  });
}