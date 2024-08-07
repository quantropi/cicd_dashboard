const fs = require('fs');
const path = require('path');
const https = require('https');

// Path to the JSON files
const componentsPath = path.join(__dirname, '..', 'src', 'data', 'components.json');
const runsPath = path.join(__dirname, '..', 'src', 'data', 'runs.json');

// Load existing data
const components = JSON.parse(fs.readFileSync(componentsPath, 'utf8'));
const runs = JSON.parse(fs.readFileSync(runsPath, 'utf8'));

// Read the GitHub event data
const eventPath = process.env.GITHUB_EVENT_PATH;
const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const incomingData = eventData.client_payload;

// Environment variable for the secret token
const accessToken = process.env.ACCESS_TOKEN;

// Refetch the run data parameters
const retryInterval = 5000; // 5 seconds
const retryTimes = 3; // Total try time is 3

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

// Function to retry fetching run data
async function fetchRunDataWithRetry(repo, runId, retries = retryTimes) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const data = await fetchRunData(repo, runId);
      if (!data.conclusion) {
        console.log('Conclusion is empty!');
        continue;
      }
      return data;
    } catch (error) {
      if (attempt < retries) {
        console.log(`Attempt ${attempt} failed. Retrying in ${retryInterval / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      } else {
        throw new Error(`Failed to fetch run data after ${retries} attempts: ${error.message}`);
      }
    }
  }
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
    // There is a delay in getting conclusion
    let fetchedData = await fetchRunDataWithRetry(incomingData.repo, incomingData.id);

    // Exit early if the branch is not "master"
    // Need to remove && fetchedData.head_branch !== 'connect_qispace_packages' later
    if (fetchedData.head_branch !== 'master' && fetchedData.head_branch !== 'release' && fetchedData.head_branch !== 'prod' && fetchedData.head_branch !== 'connect_qispace_packages') {
      console.log('Exiting script because it is not in correct branches');
      return;
    }

    // Update components and runs
    await updateComponentsAndRuns(incomingData, fetchedData);

  } catch (err) {
    console.error('Error fetching or updating data:', err);
  }
}

// Function to handle build run's test result
function handleBuildRunTestResult(repo, build_workflow_id, incomingData, fetchedData, runs) {
  const validResults = ["PASSED", "FAILED", "ABORTED"];
  let validatedTestResult = '';

  if (repo.category === "qa" && build_workflow_id && incomingData.build_version && fetchedData.conclusion !== 'cancelled') {
    if (fetchedData.conclusion === 'failure') {
      validatedTestResult = 'FAILED';
    } else if (fetchedData.conclusion === 'success') {
      if (incomingData.test_result && incomingData.test_result !== '') {
        validatedTestResult = validResults.includes(incomingData.test_result.toUpperCase()) ? incomingData.test_result.toUpperCase() : "";
      } else {
        validatedTestResult = 'PASSED';
      }
    } else {
      validatedTestResult = '';
    }

    const buildRun = runs.find(run => run.workflow_id === build_workflow_id && run.build_version === incomingData.build_version);

    if (buildRun) {
      // Update the test result of the build run
      buildRun.test_result = validatedTestResult;
      buildRun.test_run_url = fetchedData.html_url;
      buildRun.test_time = fetchedData.run_started_at;
    }
  }

  return validatedTestResult;
}

async function updateComponentsAndRuns(incomingData, fetchedData) {
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
        build_workflow_id: build_workflow_id,
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

  // Generate unique run ID for deploy_prod and release categories
  const uniqueRunId = (id, category, existingRuns) => {
    if (category === 'deploy_prod') {
      let count = 1;
      let newId = `${id}_${count}`;
      while (existingRuns.some(run => run.id === newId)) {
        count += 1;
        newId = `${id}_${count}`;
      }
      return newId;
    }
    return id;
  };

  const runId = uniqueRunId(incomingData.id, workflowCategory, runs);

  // Check if the run already exists for categories other than deploy_prod and release
  let runExists = runs.some(run => run.id === incomingData.id && run.repo === incomingData.repo);
  if (runExists && workflowCategory !== 'deploy_prod' && workflowCategory !== 'release') {
    // Update existing run instead of throwing an error
    let existingRun = runs.find(run => run.id === incomingData.id && run.repo === incomingData.repo);
    if (existingRun) {
      // Call handleBuildRunTestResult function to handle build run's test result
      let validatedTestResult = handleBuildRunTestResult(repo, build_workflow_id, incomingData, fetchedData, runs);

      existingRun.url = fetchedData.html_url;
      existingRun.workflow_name = workflow_name;
      existingRun.workflow_id = fetchedData.workflow_id;
      existingRun.run_number = fetchedData.run_number;
      existingRun.head_sha = fetchedData.head_sha;
      existingRun.time = fetchedData.run_started_at;
      existingRun.user = fetchedData.actor.login;
      existingRun.branch = fetchedData.head_branch;
      existingRun.status = fetchedData.conclusion;
      existingRun.test_result = validatedTestResult;
      existingRun.build_version = incomingData.build_version || fetchedData.run_number;
      existingRun.s3_urls = incomingData.s3_urls;

      // Save updated data back to JSON files
      fs.writeFileSync(componentsPath, JSON.stringify(components, null, 2));
      fs.writeFileSync(runsPath, JSON.stringify(runs, null, 2));

      

      console.log(`Run with ID ${incomingData.id} for repository ${incomingData.repo} updated successfully.`);
      return;
    }
  }


  // Call handleBuildRunTestResult function to handle build run's test result
  let validatedTestResult = handleBuildRunTestResult(repo, build_workflow_id, incomingData, fetchedData, runs);

  // Handle package workflows
  if (workflowCategory === 'package' && incomingData.package_json) {
    // Assuming the JSON file is downloaded to a known directory
    const packagesFilePath = path.join(__dirname, '..', 'packages.json');
    const appDetails = JSON.parse(fs.readFileSync(packagesFilePath, 'utf8'));

    for (const appInfo of appDetails.appDetails) {
      try {
        const buildWorkflowId = components.find(comp => comp.repos.some(repo => repo.name === appInfo.app))
          ?.repos.find(repo => repo.name === appInfo.app)
          ?.workflows.find(wf => wf.category === 'build')
          ?.id;

        if (buildWorkflowId) {
          const buildRun = runs.filter(run => run.workflow_id === buildWorkflowId && run.head_sha === appInfo.hash)
            .sort((a, b) => new Date(b.time) - new Date(a.time))[0];

          if (buildRun) {
            console.log(`Latest run for ${appInfo.app}:`, buildRun);
            
            buildRun.package_version = incomingData.build_version || fetchedData.run_number;
          }
        }
      } catch (err) {
        console.error('Error processing package workflows:', err);
      }
    }
  }

  // Handle release run
  // incomingData.release_json content:
  // For SDK: {"release_version": "release_v1.8.1", "details": [{"repo": "MASQ-BN", "build_workflow": "cicd_build_api.yml", "version": "189"}, {"repo": "MASQ-DS", "build_workflow": "cicd_build_api.yml", "version": "190"}, {"repo": "MASQ-KEM", "build_workflow": "cicd_build_api.yml", "version": "178"}, {"repo": "libqeep", "build_workflow": "cicd_build_api.yml", "version": "158"}]}
  // For QiSpace: {"release_version": "release_v1.8.3", "details": [{"repo": "qispace", "build_workflow": "build.yml", "version": "b_11"}]}
  // When the workflow.category === "release", it will check the the runs.json to find workflow match and build_version === version, then modify the isRelease === true, and modify the release_version to the current version.
  if ((workflowCategory === "release" || workflowCategory === 'deploy_prod') && incomingData.release_json) {
    // Assuming the JSON file is downloaded to a known directory
    const jsonFilePath = path.join(__dirname, '..', 'release_json.json');
    const releaseDetails = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    for (const detail of releaseDetails.details) {
      try {
        const buildWorkflowId = await getBuildWorkflowId(detail.repo, detail.build_workflow); // Ensure you await this function        
        const buildRun = runs.find(run => run.workflow_id === buildWorkflowId && run.build_version === detail.version);        
        if (buildRun) {
          buildRun.isRelease = true;
          buildRun.release_version = releaseDetails.release_version;
        }
      } catch (err) {
        console.error('Error processing release details:', err);
      }
    }
  }

  // Handle Deploy Production
  if (workflowCategory === 'deploy_prod' && incomingData.deploy_target) {
    try {      
      const buildRun = runs.find(run => run.workflow_id === build_workflow_id && (run.build_version === incomingData.build_version || run.release_version === incomingData.build_version));
      if (buildRun) {
        buildRun.deploy_target = buildRun.deploy_target ? `${buildRun.deploy_target}, ${incomingData.deploy_target}` : `${incomingData.deploy_target}`;
      }
    } catch (err) {
      console.error('Error processing deploy prod details:', err);
    }
  }

  // Add the new run to runs.json
  runs.push({
    id: runId,
    url: fetchedData.html_url,
    repo: incomingData.repo,
    repo_url: fetchedData.repository.html_url,
    workflow_name: workflow_name,
    workflow_id: fetchedData.workflow_id,
    run_number: fetchedData.run_number,
    head_sha: fetchedData.head_sha,
    time: fetchedData.run_started_at,
    user: fetchedData.actor.login,
    branch: fetchedData.head_branch,
    status: fetchedData.conclusion,
    test_result: validatedTestResult,
    test_run_url: null,
    test_time: null,
    build_version: incomingData.build_version || fetchedData.run_number,
    package_version: null,
    isRelease: false,
    release_version: null,
    deploy_target: null,
    s3_urls: incomingData.s3_urls
  });

  // Save updated data back to JSON files
  fs.writeFileSync(componentsPath, JSON.stringify(components, null, 2));
  fs.writeFileSync(runsPath, JSON.stringify(runs, null, 2));
}

// Execute the main function
fetchDataAndUpdateComponents();