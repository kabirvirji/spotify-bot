const login = require('facebook-chat-api');
const config = require('./config.json');
const cmd = require('node-cmd');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId : config.spotifyid,
  clientSecret : config.spotifysecret
});
let api;

async function listenFacebook(err, message) {
  // cmd.run(message.body);
  const { body } = message;
  if (body.indexOf('play') > -1) {
    const songToSearch = body.match(/play(.+)/)[1].trim();
    const searchResults = await spotifyApi.searchTracks(songToSearch);
    console.log(searchResults);
    const songToPlay = searchResults.body.tracks.items[0].name;
    cmd.run(`spotify play ${songToPlay}`);
  }
  
    // api.sendMessage(message.body, message.threadID);
}

async function init() {
  api = await loginToFacebook();
  api.listen(listenFacebook);
}

function loginToFacebook() {
  return new Promise((resolve, reject) => {
    login({ email: config.login, password: config.password }, (err, api) => {
      if (err) reject(err);
      resolve(api);
    })
  });
}

init();
