const axios = require('axios');

exports.returnUserData = async (req, res) => {
  const token = req.headers["authorization"];
  axios({
    method: "GET",
    url: ` https://api.github.com/user`,
    headers: {
      Authorization: token,
    },
  })
  .then((resp) => {
    res.statusCode = 200;
    res.send(resp.data);
  })
  .catch((err) => {
    console.log(err);
  });
}
