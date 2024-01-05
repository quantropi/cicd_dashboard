import { useEffect, useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";

const HomePage = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  useEffect(() => {
    console.log(window.location.search);
    const token = new URLSearchParams(window.location.search).get(
      "access_token"
    );
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/user/data`, {
        headers: {
          Authorization: "token " + token,
        },
      })
      .then((res) => {
        setUser(res.data);
        setLoggedIn(true);
      })
      .catch((error) => {
        console.log(error);
      });
    const gitHubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_BACKEND_URL}/auth/callback`;
    setGithubUrl(gitHubUrl);
  }, []);

  return (
    <div className="App text-center container-fluid">
      {!loggedIn ? (
        <>
          <img
            className="mb-4"
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            alt='GitHub Logo'
            width="150"
          ></img>
          <h1 className="h3 mb-3 font-weight-normal">Sign in with GitHub</h1>
          <Button
            type="primary"
            className="btn"
            size="lg"
            href={githubUrl}
          >
            Sign in
          </Button>
        </>
      ) : (
        <>
          <h1>Welcome!</h1>
          <p>
            This is a simple integration between OAuth2 on GitHub with Node.js
          </p>

          <div>
            {[...Array(1)].map((e, i) => (
              <div style={{ maxWidth: "25%", margin: "auto" }}>
                <div>
                  <img src={`${user.avatar_url}`} alt="User profile" />
                </div>
                <div>
                  <div>{user.name}</div>
                  <div>{user.bio}</div>
                  <a href={user.html_url}>GitHub Profile</a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
