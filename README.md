# Default CICD Dashboard page
https://quantropi.github.io/cicd_dashboard/

# CI/CD Dashboard Repository

This repository hosts the CI/CD Dashboard, an integrated dashboard for tracking the progress and results of continuous integration and deployment pipelines.

## Overview

The CI/CD Dashboard provides a centralized view of the workflows and their statuses across different repositories. It aims to enhance visibility and monitoring capabilities for development teams, ensuring timely feedback on the build and deployment processes.

## Features

- **Real-Time Updates**: The dashboard updates in real-time as new data is received from various CI/CD processes.
- **Workflow Tracking**: Track the status and results of each workflow execution.
- **Error Logging**: Quickly view and investigate errors and failures within your CI/CD pipelines.

## Setup Instructions

To set up the CI/CD Dashboard, clone this repository and follow the setup instructions outlined below:

### Prerequisites

- Node.js (v18 or later)
- GitHub account with access to Actions

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/quantropi/cicd_dashboard.git
    cd cicd_dashboard
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the dashboard server:
    ```bash
    npm start
    ```

## Using the Dashboard
The dashboard can be accessed via a web browser at http://localhost:3000 after starting the server.

## GitHub Actions Job Template
To integrate other workflows with this dashboard, use the provided GitHub Actions job template. This template includes steps to send workflow results to the dashboard for visualization and monitoring.

### Job Template `send-results-to-dashboard`
This job should be included in any GitHub Actions workflow where you want to report the results back to the CI/CD Dashboard.
  ```yml
  send-results-to-dashboard:
    runs-on: ott-ubuntu-latest
    if: always()
    steps:
      - name: Send results to dashboard
        env:
          REPO_NAME: ${{ github.repository }}
        run: |
          REPO_NAME="${REPO_NAME#*/}"  # Bash to remove the owner part from the repo name
          
          curl -L \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer ${{ secrets.ACCESS_DEVOPS_TOKEN }}" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            https://api.github.com/repos/quantropi/cicd_dashboard/dispatches \
            -d '{
                "event_type": "data_process",
                "client_payload": {
                    "id": "${{ github.run_id }}",
                    "repo": "'"$REPO_NAME"'",
                    "isqa": false,
                    "test_result": "",
                    "s3_urls": ""
                }
            }'

  ```

### Security
Make sure to secure your GitHub secrets and environmental variables properly to prevent unauthorized access to your dashboard and repositories.
