const axios = require('axios');

exports.getRepositories = async (req, res) => {
  const token = req.headers.authorization;
  console.log(`repoController Token: ${token}`);
  console.log(`repoController params: ${req.params.type}, ${req.params.per_page}`);

  try {
    const response = await axios.get(' https://api.github.com/orgs/quantropi/repos', {
      headers: { 
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      params: {
        type: 'private',
        per_page: 100
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repositories', error });
  }
};