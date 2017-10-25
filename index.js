require('dotenv').config();
const express = require('express');
const app = express();
const request = require('request');
const moment = require('moment');
const queryString = require('query-string');
const extend = require('lodash/extend');
const fs = require('fs');

const now = moment();

process.on('SIGUSR2', () => { process.exit(0); });

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

function isStaleBranch(branchDate) {
  return moment(branchDate).diff(now, 'months') <= -3;
}

app.get('/branches', (req, res) => {
  // request(getGithubRequestOptions(`/orgs/ARAMISAUTO/repos`), (e, r, body) => {
  //   // const repo = body[0];
  //   body.map((repo) => {
  //     const repoDir = `./stats/${repo.name}`;

  //     if (!fs.existsSync(repoDir)) {
  //       fs.mkdirSync(repoDir);
  //     }

      const repo = {
        name: 'robusto',
        owner: {
          login: 'ARAMISAUTO',
        },
      };
      const repoDir = `./stats/${repo.name}`;

      setTimeout(function() {
        request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches`, {
          per_page: 100,
        }), (e, r, branches) => {

          branches.map(branch => {
            request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches/${branch.name}`), (e, r, branchInfo) => {
              const branchFile = `${repoDir}/${branchInfo.name.replace(/\//g, '_')}.json`;
              // console.log(branchFile);
              // const authorDate = branchInfo.commit.commit.author.date;

              if (!fs.existsSync(branchFile)) {
                fs.writeFileSync(branchFile, JSON.stringify(branchInfo));
              }
              
              // if (isStaleBranch(authorDate)) {
              //   console.log(branchInfo.name);
              // }
              // const committerDate = moment(body.commit.commit.committer.date);
            });
          });

          // console.log(repo.name);
          // console.log(branches.length);
          // console.log(branches);
          // branches.map((branch) => {
          //   console.log(branch);
            // setTimeout(function() {
            //   request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches/${branch.name}`), (e, r, branchInfo) => {
            //     console.log(branchInfo);
            //     const authorDate = branchInfo.commit.commit.author.date;
                
            //     if (isStaleBranch(authorDate)) {
            //       console.log(branchInfo.name);
            //     }
            //     // const committerDate = moment(body.commit.commit.committer.date);
            //   });
            // }, 1000);
          // });
        });
      }, 1000);
      // request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches`), (e, r, branches) => {
      //   branches.map((branch) => {
      //     setTimeout(function() {
      //       request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches/${branch.name}`), (e, r, branchInfo) => {
      //         console.log(branchInfo);
      //         const authorDate = branchInfo.commit.commit.author.date;
              
      //         if (isStaleBranch(authorDate)) {
      //           console.log(branchInfo.name);
      //         }
      //         // const committerDate = moment(body.commit.commit.committer.date);
      //       });
      //     }, 1000);
      //   });
      // });
    // });


    // request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches`), (e, r, branches) => {
    //   branches.map((branch) => {
    //     request(getGithubRequestOptions(`/repos/${repo.owner.login}/${repo.name}/branches/${branch.name}`), (e, r, branchInfo) => {
    //       const authorDate = branchInfo.commit.commit.author.date;
          
    //       if (isStaleBranch(authorDate)) {
    //         console.log(branchInfo.name);
    //       }
    //       // const committerDate = moment(body.commit.commit.committer.date);
    //     });
    //   });
    // });
  // });
});

app.get('/rate', (req, res) => {
  request(getGithubRequestOptions(`/rate_limit`), (e, r, body) => {
    console.log(body);
  });
});

app.listen(3000);