const axios = require('axios');

exports.getRepoRuns = async (req, res) => {
  const token = req.headers.authorization;
  const repoName = req.params.repo;
  console.log(`workflowRunsController repoName: ${repoName}`);

  try {
    const response = await axios.get(`https://api.github.com/repos/quantropi/${repoName}/actions/runs`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error in getRepoRuns:', error);
    res.status(500).json({ message: 'Error fetching repo runs', error });
  }
}

exports.getWorkflowRuns = async (req, res) => {
  const token = req.headers.authorization;
  const repoName = req.params.repo;
  const workflowId = req.params.workflowId;

  try {
    const response = await axios.get(`https://api.github.com/repos/quantropi/${repoName}/actions/workflows/${workflowId}/runs`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error in getWorkflowRuns:', error);
    res.status(500).json({ message: 'Error fetching workflow runs', error });
  }
};