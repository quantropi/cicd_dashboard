const fs = require('fs');
const path = require('path');
const https = require('https');

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
function fetchRunData(repo, runId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/quantropi/${repo}/actions/runs/${runId}`,
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
function fetchWorkflowData(repo, workflowId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/quantropi/${repo}/actions/workflows/${workflowId}`,
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

// Function to fetch workflows using GitHub API
function fetchWorkflows(repoName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/quantropi/${repoName}/actions/workflows`,
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
          resolve(JSON.parse(data).workflows);
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

async function getBuildWorkflowId(repoName, workflowFile) {
  try {
    const workflows = await fetchWorkflows(repoName);
    const workflow = workflows.find(wf => wf.path === `.github/workflows/${workflowFile}`);
    return workflow ? workflow.id : null;
  } catch (err) {
    console.error('Error fetching workflows:', err);
    return null;
  }
}

async function fetchDataAndUpdateComponents() {
  try {
    const fetchedData = await fetchRunData(incomingData.repo, incomingData.id);

    // Exit early if the branch is not "master"
    // Should change back to if (fetchedData.event == 'workflow_dispatch' || (fetchedData.head_branch !== 'master' && fetchedData.head_branch !== 'release')) {
    if (fetchedData.head_branch !== "PE-1538-yyang" && (fetchedData.event == 'workflow_dispatch' || (fetchedData.head_branch !== 'master' && fetchedData.head_branch !== 'release'))) {
      console.log('Exiting script because it is not automatically triggered');
      return;
    }

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
      category: "product",
      url: fetchedData.repository.html_url,
      workflows: []
    };
    component.repos.push(repo);
  }

  // Check if the workflow exists in the repository, and add if not
  let workflow_name = "";
  let build_workflow_id = null;
  const workflowExists = repo.workflows.some(wf => wf.file === workflow_file);
  let workflowCategory = "tool";
  if (!workflowExists) {
    try {
      const fetchedWorkflowData = await fetchWorkflowData(incomingData.repo, fetchedData.workflow_id);
      workflow_name = fetchedWorkflowData.name;
      
      // Extract repo and file from incomingData.build_workflow and fetch the build workflow ID
      if (incomingData.build_workflow) {
        const [repoName, workflowFile] = incomingData.build_workflow.split('/');
        build_workflow_id = await getBuildWorkflowId(repoName, workflowFile);
      }

      // Assign a category based on repo's category, need to manually modified
      if (repo.category === "qa") {
        workflowCategory = "qa";
      }

      repo.workflows.push({
        id: fetchedData.workflow_id,
        file: workflow_file,
        name: workflow_name,
        build_workflow: build_workflow_id,
        url: `https://github.com/quantropi/${incomingData.repo}/actions/workflows/${workflow_file}`,
        category: workflowCategory,
      });
    } catch (err) {
      console.error('Error fetching workflow data:', err);
      return;
    }
  } else {
    // Set workflow_name to be the name inside the components.json
    const existingWorkflow = repo.workflows.find(wf => wf.file === workflow_file);
    workflow_name = existingWorkflow.name;
    build_workflow_id = existingWorkflow.build_workflow_id;
    workflowCategory = existingWorkflow.category;
  }

  // Validate test_result
  const validResults = ["PASSED", "FAILED", "ABORTED"];
  let validatedTestResult = fetchedData.conclusion !== "cancelled" && validResults.includes(incomingData.test_result.toUpperCase()) ? incomingData.test_result.toUpperCase() : "";

  // Handle build run's test_result
  // Check if the workflow is of category "qa" and override the build's test_result
  if (repo.category === "qa" && build_workflow_id && incomingData.build_version) {
    const buildRun = runs.find(run => run.workflow_id === build_workflow_id && run.build_version === incomingData.build_version);
    if (buildRun) {
      // Update the test result of the build run
      buildRun.test_result = validatedTestResult;
      buildRun.test_run_url = fetchedData.html_url;
    }
  }

  // Handle release run
  // incomingData.release_json content:
  // For SDK: {"release_version": "release_v1.8.1", "details": [{"repo": "MASQ-BN", "build_workflow": "cicd_build_api.yml", "version": "189"}, {"repo": "MASQ-DS", "build_workflow": "cicd_build_api.yml", "version": "190"}, {"repo": "MASQ-KEM", "build_workflow": "cicd_build_api.yml", "version": "178"}, {"repo": "libqeep", "build_workflow": "cicd_build_api.yml", "version": "158"}]}
  // For QiSpace: {"release_version": "release_v1.8.3", "details": [{"repo": "qispace", "build_workflow": "build.yml", "version": "b_11"}]}
  // When the workflow.category === "release", it will check the the runs.json to find workflow match and build_version === version, then modify the isRelease === true, and modify the release_version to the current version.
  if (workflowCategory === "release" && incomingData.release_json) {
    const releaseDetails = JSON.parse(incomingData.release_json);
    releaseDetails.details.forEach(detail => {
      const build_workflow_id = getBuildWorkflowId(detail.repo, detail.build_workflow);
      const buildRun = runs.find(run => run.workflow_id === build_workflow_id && run.build_version === detail.version);
      if (buildRun) {
        buildRun.isRelease = true;
        buildRun.release_version = releaseDetails.release_version;
      }
    });
  }

  // Add the new run to runs.json
  runs.push({
    id: incomingData.id,
    url: fetchedData.html_url,
    repo: incomingData.repo,
    repo_url: fetchedData.repository.html_url,
    workflow_name: workflow_name,
    workflow_id: fetchedData.workflow_id,
    run_number: fetchedData.run_number,
    time: fetchedData.run_started_at,
    user: fetchedData.actor.login,
    branch: fetchedData.head_branch,
    status: fetchedData.conclusion,
    test_result: validatedTestResult,
    test_run_url: null,
    build_version: incomingData.build_version || fetchedData.run_number,
    isRelease: false,
    release_version: null,
    s3_urls: incomingData.s3_urls
  });

  // Save updated data back to JSON files
  fs.writeFileSync(componentsPath, JSON.stringify(components, null, 2));
  fs.writeFileSync(runsPath, JSON.stringify(runs, null, 2));
}
