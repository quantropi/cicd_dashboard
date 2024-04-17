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
function fetchRunData(runId) {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${incomingData.repo_owner}/${incomingData.repo}/actions/runs/${runId}`,
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
      callback(JSON.parse(data));
    });
  })
    .on('error', e => {
      console.error(`Problem with request: ${e.message}`);
      callback(null, e);
    })
    .end();
}

// Function call
fetchRunData(incomingData.id, (fetchedData, err) => {
  if (err) {
    console.error('Error fetching data:', err);
    return;
  }
  
  // Process and integrate fetched data with incomingData if necessary
  console.log(fetchedData);

  // Update components and runs
  updateComponentsAndRuns(incomingData, fetchedData);
});

// Handle update Components and Runs json files
function updateComponentsAndRuns(incomingData, fetchedData) {

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

  // Check if the workflow exists in the repository, add if not
  const workflowExists = repo.workflows.some(wf => wf.file === workflow_file);
  if (!workflowExists) {
    repo.workflows.push({
      file: workflow_file,
      name: fetchedData.name,
      default_display: true,
      url: `https://github.com/quantropi/${incomingData.repo}/actions/workflows/${workflow_file}`
    });
  }

  // Add the new run to runs.json
  runs.push({
    id: incomingData.id,
    url: fetchedData.html_url,
    repo: incomingData.repo,
    workflow: workflow_file,
    workflow_name: fetchedData.name,
    run_number: fetchedData.run_number,
    time: fetchedData.run_started_at,
    user: fetchedData.actor.quantropi-yyang,
    branch: fetchedData.head_branch,
    status: fetchedData.conclusion,
    isqa: incomingData.isqa,
    test_result: incomingData.test_result,
    s3_urls: incomingData.s3_urls
  });

  // Save updated data back to JSON files
  fs.writeFileSync(componentsPath, JSON.stringify(components, null, 2));
  fs.writeFileSync(runsPath, JSON.stringify(runs, null, 2));
}

