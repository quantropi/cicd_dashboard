require('dotenv').config();
const axios = require('axios');

// Request a user's GitHub identity
// https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity
exports.redirectToGitHub = (req, res) => {
  const baseURL = 'https://github.com/login/oauth/authorize';
  const queryParams = `?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
  const authURL = baseURL + queryParams;
  res.redirect(authURL);
};

// Users are redirected back to your site by GitHub
// https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
exports.handleGitHubCallback = async (req, res) => {

  const GITHUB_URL = "https://github.com/login/oauth/access_token";

  axios({
    method: "POST",
    url: `${GITHUB_URL}?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${req.query.code}`,
    headers: {
      Accept: "application/json",
    },
  })
  .then((response) => {
    res.redirect(
      `${process.env.FRONTEND_URL}?access_token=${response.data.access_token}`
    );
  })
  .catch((err) => {
    console.log("********************ERROR********************");
    console.log(`Error occured ${err}`);
  });
};