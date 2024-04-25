const fs = require('fs');
const path = require('path');
const https = require('https');
const { hostname } = require('os');

// Path to the JSON files
const componentsPath = path.join(__dirname, '..', 'public', 'data', 'components.json');
const runsPath = path.join(__dirname, '..', 'public', 'data', 'runs.json');

// Load existing data
const components = JSON.parse(fs.readFileSync(componentsPath, 'utf8'));
const runs = JSON.parse(fs.readFileSync(runsPath, 'utf8'));

// Read the GitHub event data
const eventPath = process.env.GITHUB_EVENT_PATH;
const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const incomingData = eventData.client_payload;

// Environment variable for the secret token
const accessToken = process.env.ACCESS_TOKEN;

// Function to fetch run data using GitHub API
function fetchRunData(runId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/quantropi/${incomingData.repo}/actions/runs/${runId}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    })
      .on('error', e => {
        reject(e);
      })
      .end();
  });
}

// Function to fetch workflow data using GitHub API
function fetchWorkflowData(workflowId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/quantropi/${incomingData.repo}/actions/workflows/${workflowId}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    })
      .on('error', e => {
        reject(e);
      })
      .end();
  });
}

async function fetchDataAndUpdateComponents() {
  try {
    const fetchedData = await fetchRunData(incomingData.id);

    // Update components and runs
    await updateComponentsAndRuns(incomingData, fetchedData);

  } catch (err) {
    console.error('Error fetching or updating data:', err);
  }
}

// Execute the function
fetchDataAndUpdateComponents();

async function updateComponentsAndRuns(incomingData, fetchedData) {
  // Check if the run already exists
  const runExists = runs.some(run => run.id === incomingData.id && run.repo === incomingData.repo);
  if (runExists) {
    throw new Error(`Run with ID ${incomingData.id} for repository ${incomingData.repo} already exists.`);
  }

  // Get workflow file name
  let workflow_file = fetchedData.path.split('/').pop();

  // Find or create the component that should contain the repository
  let component = components.find(comp => comp.repos.some(repo => repo.name === incomingData.repo));
  let repo = component?.repos.find(r => r.name === incomingData.repo);

  if (!component) {
    // Add new repo to "Others" component if not found
    component = components.find(comp => comp.name === "Others");
    if (!component) {
      component = {
        name: "Others",
        level: "component",
        description: "",
        repos: []
      };
      components.push(component);
    }
    repo = {
      name: incomingData.repo,
      level: "repo",
      description: "",
      url: fetchedData.repository.html_url,
      workflows: []
    };
    component.repos.push(repo);
  }

  // Check if the workflow exists in the repository, and add if not
  let workflow_name = "";
  const workflowExists = repo.workflows.some(wf => wf.file === workflow_file);
  if (!workflowExists) {
    try {
      const fetchedWorkflowData = await fetchWorkflowData(fetchedData.workflow_id);
      workflow_name = fetchedWorkflowData.name;
      repo.workflows.push({
        id: fetchedData.workflow_id,
        file: workflow_file,
        name: workflow_name,
        default_display: true,
        url: `https://github.com/quantropi/${incomingData.repo}/actions/workflows/${workflow_file}`
      });
    } catch (err) {
      console.error('Error fetching workflow data:', err);
      return;
    }
  } else {
    // Set workflow_name to be the name inside the components.json
    const existingWorkflow = repo.workflows.find(wf => wf.file === workflow_file);
    workflow_name = existingWorkflow.name;
  }

  // Validate test_result
  const validResults = ["PASSED", "FAILED", "ABORTED"];
  let validatedTestResult = fetchedData.conclusion != "cancelled" && validResults.includes(incomingData.test_result.toUpperCase()) ? incomingData.test_result.toUpperCase() : "";

  // Add the new run to runs.json
  runs.push({
    id: incomingData.id,
    url: fetchedData.html_url,
    repo: incomingData.repo,
    workflow: workflow_file,
    workflow_name: workflow_name,
    workflow_id: fetchedData.workflow_id,
    run_number: fetchedData.run_number,
    time: fetchedData.run_started_at,
    user: fetchedData.actor.login,
    branch: fetchedData.head_branch,
    status: fetchedData.conclusion,
    isqa: incomingData.isqa,
    test_result: validatedTestResult,
    s3_urls: incomingData.s3_urls
  });

  // Save updated data back to JSON files
  fs.writeFileSync(componentsPath, JSON.stringify(components, null, 2));
  fs.writeFileSync(runsPath, JSON.stringify(runs, null, 2));
}
