class WebhookClient {
  constructor(request, webhookTargetUrl) {
    this.request = request;

    const parsedUrl = new URL(webhookTargetUrl);
    this.token = parsedUrl.pathname
      .split('/')
      .filter(Boolean)[0];

    if (!this.token) {
      throw new Error(
        'WEBHOOK_TARGET_URL must contain a valid Webhook.site token.'
      );
    }

    this.requestsApiUrl =
      `https://webhook.site/token/${this.token}/requests`;
  }

  async getRequests() {
    const response = await this.request.get(
      `${this.requestsApiUrl}?sorting=newest&per_page=20`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok()) {
      throw new Error(
        `Webhook.site request listing failed with status ` +
        `${response.status()}.`
      );
    }

    const body = await response.json();

    return Array.isArray(body)
      ? body
      : body.data || [];
  }

  async getLatestRequestId() {
    const requests = await this.getRequests();
    return requests[0]?.uuid || null;
  }

  async waitForNewRequest({
    previousRequestId,
    expectedMethod = 'GET',
    timeout = 30000,
  }) {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const requests = await this.getRequests();

      const match = requests.find((item) => {
        return (
          item.uuid !== previousRequestId &&
          item.method === expectedMethod
        );
      });

      if (match) {
        return match;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );
    }

    throw new Error(
      `Webhook.site did not receive a new ` +
      `${expectedMethod} request within ${timeout / 1000} seconds.`
    );
  }
}

module.exports = { WebhookClient };