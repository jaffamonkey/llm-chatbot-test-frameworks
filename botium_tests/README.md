# Botium Dialogflow Automation Suite

This repository contains an automated conversational testing suite built with [Botium](https://botium.atlassian.net/wiki/spaces/BOTIUM/overview) and Mocha, designed to evaluate Dialogflow agents.

## Prerequisites

Before setting up the project, ensure you have the following installed on your machine:

*   **Node.js**: v14.0.0 or higher recommended.
*   **npm**: Node Package Manager (comes bundled with Node.js).
*   **Google Cloud Service Account credentials**: A `dialogflow.json` file authorized to access your Dialogflow project.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```

2.  **Install dependencies:**
    Run the following command to install the required Node.js packages (Botium bindings, Mocha, Mochawesome, and the Dialogflow connector):
    ```bash
    npm install
    ```

## Configuration

This suite requires authentication with Google Cloud to send test utterances to your Dialogflow agent. 

### 1. Configure Authentication

Instead of hardcoding sensitive keys in `botium.json`, the most secure method is to use a Google Service Account JSON file. 

1.  Obtain your service account key file from the Google Cloud Console.
2.  Save the file in the root of this project as `dialogflow.json`. **Do not commit this file to version control.** (Ensure `dialogflow.json` is added to your `.gitignore`).
3.  Set the environment variable in your terminal to point to this file:
    ```bash
    export GOOGLE_APPLICATION_CREDENTIALS="./dialogflow.json"
    ```
    *Tip: You may want to add this export command to your `~/.zshrc` or `~/.bashrc` profile, or use a tool like `dotenv` if you don't want to type it every session.*

### 2. Verify `botium.json`

Ensure your `botium.json` looks like this. It acts as the bridge telling Botium which Dialogflow project to target, while relying on the environment variable above for the actual credentials:

```json
{
  "Capabilities": {
    "PROJECTNAME": "PaulPizza",
    "CONTAINERMODE": "dialogflow",
    "DIALOGFLOW_PROJECT_ID": "paulpizza-klcy",
    "DIALOGFLOW_USE_INTENT": false
  }
}
```

## Adding and Writing Tests

Conversation tests are written in Botiumscript (`.conv` files) and stored in the `spec/convo/` directory.

To add a new test, simply create a new file (e.g., `MyNewTest.conv`) in `spec/convo/`. The test runner will automatically detect and execute any file in this directory.

**Example `spec/convo/Greetings.conv`:**
```text
=== Greeting Conversation ===

#me
Hello

#bot
PARTIAL: How can I help you today?
```

## Running the Tests

You can execute the test suite using standard npm scripts.

### Standard Console Output
To run the tests and view the results directly in your terminal:
```bash
npm test
```

### Generate HTML Reports
To run the tests and generate a formatted HTML report using Mochawesome:
```bash
npm run test:report
```
Once the test run completes, you will find a new `reports/` directory in the root of the project containing `mochawesome.html`. Open this file in your browser to view the test results.
