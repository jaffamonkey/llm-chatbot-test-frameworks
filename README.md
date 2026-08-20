# 🤖 DTAC Chatbot Functional Testing — Mocha Edition (No Docker)

## 🧭 Overview
This guide shows how to run **DTAC (Digital Technology Assessment Criteria)** chatbot tests using a simple **Node.js + Mocha** test framework — no Botium Box or Docker required.

It provides:
- ✅ Lightweight REST-based functional testing  
- ✅ Regex assertions for DTAC clause validation  
- ✅ Clear test results in console and CI pipelines  
- ✅ Easy integration with GitHub Actions or Jenkins  

---

## 🧰 1️⃣ Prerequisites

### Install Node.js
Make sure you have Node 16+:
```bash
node -v
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

## 🧩 2️⃣ Project Structure

```
dtac-chatbot-tests/
 ├── tests/
 │   ├── sectionA.test.js
 │   ├── sectionB.test.js
 │   ├── sectionC.test.js
 │   ├── sectionD.test.js
 │   └── general.test.js
 ├── .env
 ├── package.json
 └── README.md
```

---

## ⚙️ 3️⃣ Environment Variables

`.env`
```bash
API_URL=https://api.your-chatbot.com/message
API_TOKEN=your_api_token_here
```

---

## 🧪 4️⃣ Example Mocha Test (DTAC Section C — Technical & Data Protection)

`tests/sectionC.test.js`
```javascript
import axios from 'axios';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL;
const API_TOKEN = process.env.API_TOKEN;

// Helper: POST message to chatbot
async function sendMessage(message) {
  const res = await axios.post(
    API_URL,
    { message },
    { headers: { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' } }
  );
  return res.data.response || '';
}

// Regex helper for AND-style term checking
function matchesAllTerms(response, terms) {
  return terms.every(term => new RegExp(`\b${term}\b`, 'i').test(response));
}

describe('DTAC Section C — Technical & Data Protection', () => {
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

## 🧩 5️⃣ Add Scripts to `package.json`

```json
"scripts": {
  "test": "mocha tests/**/*.test.js --timeout 10000",
  "test:watch": "mocha tests/**/*.test.js --watch",
  "test:report": "mocha tests/**/*.test.js --reporter spec"
}
```

---

## 🏃 6️⃣ Run Tests

```bash
npm test
```

Sample output:
```
  DTAC Section C — Technical & Data Protection
    ✓ should mention DPIA, GDPR, encryption, privacy, and ICO when asked about data protection
    ✓ should mention cybersecurity measures when asked about system safety

  2 passing (1s)
```

---

## 🧮 7️⃣ Add Other Sections (A–D)

Just replicate the same pattern — for example:

- `sectionA.test.js`: Organisation & Governance  
- `sectionB.test.js`: Clinical Safety & Product Assurance  
- `sectionC.test.js`: Data Protection & Cybersecurity  
- `sectionD.test.js`: Usability & Accessibility  

Each test file can contain regex expectations for its DTAC clauses.  

---

## 📈 8️⃣ Reporting Options

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
```
mochawesome-report/mochawesome.html
```

---

## ⚙️ 9️⃣ Continuous Integration Example (GitHub Actions)

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
      - run: npm install
      - run: npm test
        env:
          API_URL: ${{ secrets.API_URL }}
          API_TOKEN: ${{ secrets.API_TOKEN }}
```

---

## 🧾 10️⃣ Why This Approach Rocks

| Feature | Mocha Tests | Botium Box |
|----------|--------------|-------------|
| Setup | Just Node.js | Docker or Cloud setup |
| Performance | ⚡ Fast (REST calls only) | Moderate |
| Flexibility | Full JS control | GUI managed |
| Regex Validation | ✅ Supported | ✅ Supported |
| CI/CD | Native (npm test) | Via Box API |
| Reports | Mochawesome, JUnit | HTML, PDF, JUnit |
| Cost | Free | Community or Paid |

---

## 🏁 11️⃣ Summary

✅ No Docker or Botium dependencies  
✅ All DTAC clauses tested via regex and keyword checks  
✅ Works in VS Code, local terminal, or GitHub Actions  
✅ Perfect for **agile compliance regression** testing  






time curl -X POST "$API_URL" \
  -H "Authorization: $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ping"}'