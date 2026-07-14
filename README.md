# 🚀 Beeceptor HTTP Callout Automation with Playwright

![Playwright](https://img.shields.io/badge/Playwright-Automation-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Status](https://img.shields.io/badge/Status-Completed-success)

An end-to-end automation project built using **Playwright** and **JavaScript** to demonstrate Beeceptor's **HTTP Callout** feature. The automation creates a temporary HTTP Callout rule, triggers the matching API request, verifies successful delivery using **Webhook.site**, and automatically cleans up the created test data.

---

# 📖 Project Overview

This project automates the complete Beeceptor HTTP Callout workflow following the **Page Object Model (POM)** design pattern.

The automation performs the following steps:

- Reuses an existing Beeceptor endpoint.
- Creates a temporary HTTP Callout rule.
- Configures:
  - Matching API path
  - Target Webhook.site URL
  - Rule description
- Saves the rule.
- Triggers the matching API request.
- Verifies that the HTTP Callout was successfully delivered.
- Deletes the temporary rule to keep the endpoint clean.

---

# ✨ Features

- ✅ End-to-End Browser Automation
- ✅ Page Object Model (POM)
- ✅ Dynamic Test Data Generation
- ✅ Environment Variable Configuration
- ✅ HTTP Callout Verification
- ✅ API Validation using Playwright Request Context
- ✅ Automatic Cleanup after Test Execution
- ✅ Reusable and Modular Code Structure

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Playwright | Browser Automation |
| JavaScript | Automation Scripting |
| Node.js | Runtime Environment |
| Beeceptor | HTTP Callout Configuration |
| Webhook.site | HTTP Callout Verification |
| Git & GitHub | Version Control |

---

# 📂 Project Structure

```text
beeceptor-playwright-assignment
│
├── pages
│   ├── HomePage.js
│   └── EndpointPage.js
│
├── tests
│   └── beeceptor-callout.spec.js
│
├── utils
│   ├── config.js
│   └── WebhookClient.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.js
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/G-Sneha08/beeceptor-playwright-assignment.git
cd beeceptor-playwright-assignment
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file using `.env.example` as a reference.

Example:

```env
BEECEPTOR_CONSOLE_URL=https://app.beeceptor.com/console/your-endpoint
BEECEPTOR_API_URL=https://your-endpoint.free.beeceptor.com
WEBHOOK_TARGET_URL=https://webhook.site/your-token

DEMO_MODE=true
DEMO_SLOW_MO=250
DEMO_PAUSE_MS=350
```

---

# ▶️ Running the Automation

Run the complete automation:

```bash
npm test
```

Run in headed mode:

```bash
npm run test:headed
```

View the HTML report:

```bash
npx playwright show-report
```

---

# 🔄 Automation Workflow

```text
Open Beeceptor Endpoint
          │
          ▼
Create HTTP Callout Rule
          │
          ▼
Configure Matching Path
          │
          ▼
Configure Target Webhook URL
          │
          ▼
Save Rule
          │
          ▼
Trigger Matching API Request
          │
          ▼
Verify HTTP Callout via Webhook.site
          │
          ▼
Delete Temporary Rule
          │
          ▼
Test Completed Successfully
```

---

# 📊 Sample Output

```text
Beeceptor status: 200

Triggered URL:
https://your-endpoint.free.beeceptor.com/playwright-callout-xxxxxxxx

HTTP Callout successfully received.

Webhook request ID:
9dd992db-70c3-4f1f-b1af-d2b99add2b94

Temporary Beeceptor rule deleted successfully.

1 passed
```

---

# 🏗 Design Highlights

- Page Object Model (POM) architecture
- Reusable page classes
- Environment-based configuration
- Dynamic test data generation
- Browser automation with Playwright
- API verification using Playwright Request Context
- Automatic cleanup after execution
- Modular and maintainable project structure

---

# 🔒 Security

Sensitive information such as Beeceptor endpoints and Webhook.site URLs are stored using **environment variables**.

The `.env` file is excluded from version control, while `.env.example` provides the required configuration template.

---

# 📌 Assignment Coverage

This project satisfies all the requirements of the Beeceptor pre-screening assignment:

- ✔ Reuse/Create Beeceptor Endpoint
- ✔ Configure HTTP Callout Rule
- ✔ Trigger Matching API Request
- ✔ Verify Successful HTTP Callout
- ✔ Automatic Cleanup
- ✔ Public GitHub Repository
- ✔ Playwright + JavaScript Implementation

---

# 👩‍💻 Author

**Sneha G**

GitHub: https://github.com/G-Sneha08

---

# 🙏 Acknowledgement

This project was developed as part of the **Beeceptor Software Developer Intern Pre-screening Assignment**, demonstrating browser automation, API testing, and end-to-end workflow validation using Playwright.