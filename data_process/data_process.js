const fs = require('fs');
const path = require('path');

// Path to the JSON files
const componentsPath = path.join(__dirname, 'src', 'public', 'data', 'components.json');
const runsPath = path.join(__dirname, 'src', 'public', 'data', 'runs.json');

// Read the GitHub event data
const eventPath = process.env.GITHUB_EVENT_PATH;
const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const incomingData = eventData.client_payload;

// Load existing data
const components = JSON.parse(fs.readFileSync(componentsPath, 'utf8'));
const runs = JSON.parse(fs.readFileSync(runsPath, 'utf8'));

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
    url: incomingData.url.split('/actions')[0], // Assuming URL includes the action run
    workflows: []
  };
  component.repos.push(repo);
}

// Check if the workflow exists in the repository, add if not
const workflowExists = repo.workflows.some(wf => wf.file === incomingData.workflow);
if (!workflowExists) {
  repo.workflows.push({
    file: incomingData.workflow,
    name: incomingData.workflow_name,
    default_display: true,
    url: incomingData.url
  });
}

// Add the new run to runs.json
runs.push({
  id: incomingData.id,
  url: incomingData.url,
  repo: incomingData.repo,
  workflow: incomingData.workflow,
  workflow_name: incomingData.workflow_name,
  run_number: incomingData.run_number,
  time: incomingData.time,
  user: incomingData.user,
  branch: incomingData.branch,
  status: incomingData.status,
  isqa: incomingData.isqa,
  test_result: incomingData.test_result,
  s3_urls: incomingData.s3_urls
});

// Save updated data back to JSON files
fs.writeFileSync(componentsPath, JSON.stringify(components, null, 2));
fs.writeFileSync(runsPath, JSON.stringify(runs, null, 2));
