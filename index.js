require('dotenv').config();
const express = require('express');
const app = express();
const request = require('request');
const moment = require('moment');
const queryString = require('query-string');
const extend = require('lodash/extend');
const githubOAuth = require('github-oauth')({
  githubClient: process.env.GITHUB_ID,
  githubSecret: process.env.GITHUB_SECRET,
  baseURL: 'http://localhost:3000',
  loginURI: '/login',
  callbackURI: '/callback',
  scope: 'user' // optional, default scope is set to user
});

function getGithubRequestOptions(url, options) {
    const defaultOptions = {
      access_token: process.env.GITHUB_ACCESS_TOKEN,
    }

    const params = queryString.stringify(extend(defaultOptions, options))

    return {
        url: `https://api.github.com${url}?${params}`,
        headers: { 'user-agent': 'TestCool' },
        json: true,
    }
}

// app.get('/login', (req, res) => {
//   res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_ID}&redirect_uri=http://127.0.0.1:3000/callback&state=random`);
// });

// app.get('/callback', (req, res) => {
//   request.post({
//     url:'https://github.com/login/oauth/access_token',
//     form: {
//       client_id: process.env.GITHUB_ID,
//       client_secret: process.env.GITHUB_SECRET,
//       code: req.query.code,
//       state: req.query.state
//     }
//   }, (err, response, body) => {
//     console.log(body);
//   });
// });

app.get('/branches', (req, res) => {
  request(getGithubRequestOptions(`/orgs/ARAMISAUTO/repos`), (e, r, body) => {
    // body.map((repo) => {
    //   console.log(repo.name);
    //   request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches`), (e, r, body) => {
    //     console.log(body);
    //   });
    // });

    const repo = body[0];
    console.log(repo.name);
    request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches`), (e, r, body) => {
      request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches/${body[0].name}`), (e, r, body) => {
        console.log(body.commit.commit.author);
        console.log(body.commit.commit.committer);
      });
    });
  });
});

app.listen(3000);