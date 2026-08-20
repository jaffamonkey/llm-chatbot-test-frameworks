# Botium Ollama Automation Suite

This repository contains an automated conversational testing suite built with [Botium](https://botium.atlassian.net/wiki/spaces/BOTIUM/overview) and Mocha, configured to evaluate a local [Ollama](https://ollama.com/) LLM instance.

## Prerequisites

Before setting up the project, ensure you have the following installed:

*   **Node.js**: v14.0.0 or higher.
*   **Ollama**: Installed and running locally.
*   **Mistral Model**: Pulled into your local Ollama environment.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```

2.  **Install Node dependencies:**
    ```bash
    npm install
    ```

3.  **Prepare Ollama:**
    Ensure your local Ollama service is running. Pull the Mistral model if you haven't already:
    ```bash
    ollama pull mistral
    ```

## Configuration

This suite uses Botium's built-in `simplerest` connector to communicate directly with Ollama's local HTTP API (running on `http://127.0.0.1:11434` by default). 

Because this connects locally, **you do not need any external API keys, service accounts, or cloud configurations.** All interactions remain entirely on your machine.

Your `botium.json` controls the API connection. If you wish to test a model other than Mistral (e.g., `llama3`), simply update the `"model"` parameter in that file.

## Adding and Writing Tests

Conversation tests are written in Botiumscript (`.conv` files) and stored in the `spec/convo/` directory. 

Because LLMs can have slight variations in their output compared to deterministic decision trees like Dialogflow, utilizing `PARTIAL` assertions is highly recommended.

**Example `spec/convo/Greetings.conv`:**
```text
=== Greeting Conversation ===

#me
Hello, I am testing your functionality.

#bot
PARTIAL: How can I help
```

## Running the Tests

Ensure your local Ollama app is open and running in the background before executing the suite.

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
