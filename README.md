# Local LLM & Chatbot API Testing Suite

## Overview
This guide shows how to run **DTAC (Digital Technology Assessment Criteria)** chatbot tests using a simple **Node.js + Mocha** test framework. Originally built for cloud-hosted chatbot APIs, this suite is optimized to run locally against **Ollama** models like Mistral.

It provides:
- ✅ Lightweight REST-based functional testing
- ✅ Regex assertions for DTAC clause validation
- ✅ Clear test results in console and CI pipelines
- ✅ Easy integration with GitHub Actions or Jenkins
- ✅ Robust Bash scripts for performance and latency monitoring

---

## Prerequisites

### Install Node.js & Ollama
Make sure you have Node 16+:
```bash
node -v
```
Install [Ollama](https://ollama.com/) and pull the Mistral model:
```bash
ollama run mistral
```

### Initialize project
```bash
mkdir dtac-chatbot-tests
cd dtac-chatbot-tests
npm init -y
```

### Install dependencies
```bash
npm install --save-dev mocha chai axios dotenv
```

---

## Project Structure

```text
dtac-chatbot-tests/
├── README.md
├── api
│   ├── performance-dashboard.html
│   └── quick-curl-check-sendmessage-endpoint.sh
├── botium-tests
│   ├── README.md
│   ├── botium.json
│   ├── package.json
│   └── spec
│       ├── botium.spec.js
│       └── convo
│           ├── A_B_Context.conv
│           ├── C1_ClinicalSafety.conv
│           ├── C2_DataProtection.conv
│           ├── C3_TechnicalSecurity.conv
│           └── C4_Interoperability_and_D1_Usability.conv
├── functional
│   ├── package.json
│   ├── test_utils
│   │   ├── SendMessage.js
│   │   └── expectResponse.js
│   └── tests
│       ├── DTAC_Audit_Tests_Conversational.test.js
│       ├── DTAC_Challenging_Tests_Conversational.test.js
│       ├── DTAC_E2E_Conversational_Advanced.test.js
│       ├── DTAC_E2E_Conversational_Basic.test.js
│       ├── DTAC_General_Awareness_Conversational.test.js
│       ├── DTAC_Section_A_Conversational.test.js
│       ├── DTAC_Section_B_Conversational.test.js
│       ├── DTAC_Section_C_Conversational.test.js
│       └── DTAC_Section_D_Conversational.test.js
├── performance
│   ├── load
│   │   ├── messages-dtac.txt
│   │   ├── send-messages.sh
│   │   └── ux-api-dashboard.html
```

---

## Environment Variables

Create a `.env` file at the root of your project:
`.env`
```bash
OLLAMA_API_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=mistral
```

---

## Example Mocha Test (DTAC Section C - Technical & Data Protection)

`tests/sectionC.test.js`
```javascript
import axios from 'axios';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

// Helper: POST message to local Ollama API
async function sendMessage(message) {
  const res = await axios.post(
    API_URL,
    { model: OLLAMA_MODEL, prompt: message, stream: false },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data.response || '';
}

// Regex helper for AND-style term checking
function matchesAllTerms(response, terms) {
  return terms.every(term => new RegExp(`\\b${term}\\b`, 'i').test(response));
}

describe('DTAC Section C - Technical & Data Protection', function () {
  this.timeout(90000); // Increased timeout for local LLM generation

  it('should mention DPIA, GDPR, encryption, privacy, and ICO when asked about data protection', async () => {
    const userMessage = 'How do we comply with data protection under DTAC?';
    const botReply = await sendMessage(userMessage);

    const terms = ['DPIA', 'GDPR', 'encryption', 'privacy', 'ICO'];
    const allTermsPresent = matchesAllTerms(botReply, terms);

    expect(allTermsPresent, `Response missing expected DTAC terms: ${botReply}`).to.be.true;
  });

  it('should mention cybersecurity measures when asked about system safety', async () => {
    const userMessage = 'What cybersecurity measures does the DTAC chatbot use?';
    const botReply = await sendMessage(userMessage);

    const regex = /(?=.*\bCyber\s*Essentials\b)(?=.*\bMFA\b)(?=.*\bpenetration\b)(?=.*\bincident\b)(?=.*\bcertification\b).*/i;
    expect(botReply, `Response was:\n${botReply}`).to.match(regex);
  });
});
```

---

## Performance Testing with Bash

Alongside the Mocha framework, this repository includes robust Bash scripts to test connection phases (DNS, SSL, TTFB) and latency against the local LLM.

*   `quick-curl-check-sendmessage-endpoint.sh`: Pings the Ollama instance at a set interval to log health and response times to a CSV.
*   `dtac-runner.sh`: A bulletproof extraction script that iterates over a text file of questions (`messages-dtac.txt`), sends them to Ollama, and safely extracts the text avoiding JSON parse errors.

---

## Add Scripts to `package.json`

```json
"scripts": {
  "test": "mocha tests/**/*.test.js --timeout 90000",
  "test:watch": "mocha tests/**/*.test.js --watch",
  "test:report": "mocha tests/**/*.test.js --reporter spec"
}
```

---

## Run Tests

```bash
npm test
```

Sample output:
```text
  DTAC Section C - Technical & Data Protection
    ✓ should mention DPIA, GDPR, encryption, privacy, and ICO when asked about data protection
    ✓ should mention cybersecurity measures when asked about system safety

  2 passing (12s)
```

---

## Add Other Sections (A–D)

Just replicate the same pattern - for example:

- `sectionA.test.js`: Organisation & Governance
- `sectionB.test.js`: Clinical Safety & Product Assurance
- `sectionC.test.js`: Data Protection & Cybersecurity
- `sectionD.test.js`: Usability & Accessibility

Each test file can contain regex expectations for its DTAC clauses.  

---

## Reporting Options

You can add Mocha reporters for CI/CD pipelines:

### Install `mochawesome` for HTML reports
```bash
npm install --save-dev mochawesome
```

Then update the test script:
```json
"test:report": "mocha tests/**/*.test.js --reporter mochawesome"
```

Run it:
```bash
npm run test:report
```

Generates:
```text
mochawesome-report/mochawesome.html
```

---

## Continuous Integration Example (GitHub Actions)

*Note: Running local LLMs in CI requires either a self-hosted runner with sufficient hardware (GPU recommended) or a pre-configured Ollama service step.*

`.github/workflows/dtac-tests.yml`
```yaml
name: DTAC Chatbot Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install & Start Ollama
        run: |
          curl -fsSL https://ollama.com/install.sh | sh
          ollama serve &
          sleep 5
          ollama run mistral &
      - run: npm install
      - run: npm test
        env:
          OLLAMA_API_URL: http://localhost:11434/api/generate
          OLLAMA_MODEL: mistral
```

---

## Why This Approach Rocks

| Feature | Mocha Tests | Botium Box |
|----------|--------------|-------------|
| Setup | Just Node.js + Ollama | Docker or Cloud setup |
| Performance | ⚡ Bound only by local hardware | Moderate |
| Flexibility | Full JS control | GUI managed |
| Regex Validation | ✅ Supported | ✅ Supported |
| CI/CD | Native (npm test) | Via Box API |
| Reports | Mochawesome, JUnit | HTML, PDF, JUnit |
| Cost | Free (Local Inference) | Community or Paid |

---

## Summary

✅ No Botium dependencies
✅ All DTAC clauses tested via regex and keyword checks
✅ Works in VS Code, local terminal, or GitHub Actions
✅ Perfect for **agile compliance regression** testing
✅ Completely private and localized data via Ollama Mistral

### Quick cURL Check

```bash
time curl -X POST "http://localhost:11434/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral", "prompt":"Ping", "stream": false}'
```
