const axios = require('axios');

exports.getWorkflows = async (req, res) => {
  const token = req.headers.authorization;
  console.log(`workflowsController token: ${token}`);
  const repoName = req.params.repo;
  console.log(`workflowsController repoName: ${repoName}`);

  try {
    const response = await axios.get(`https://api.github.com/repos/quantropi/${repoName}/actions/workflows`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    // console.log(response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflows', error });
  }
};
