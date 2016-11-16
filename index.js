const login = require('facebook-chat-api');
const prettyjson = require('prettyjson');
const config = require('./config.json');
const cmd = require('node-cmd');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId : config.spotifyid,
  clientSecret : config.spotifysecret
});
let api;

function prettyConsole(data) {
  console.log(prettyjson.render(data));
}

// async function checkThreadPlaylist(threadID) {
//   const playlists = await spotifyApi.getUserPlaylists(config.spotifyUsername);
//   prettyConsole(playlists);
// }

// async function getUser(username) {
//   prettyConsole(await spotifyApi.getUser(username));
// }

async function listenFacebook(err, message) {
  checkThreadPlaylist(message.threadID);
  
  // cmd.run(message.body);
  const { body } = message;

  // trying to play a playlist

  // if (body.indexOf('list') != -1) { // the word list is in the command, we can expect a playlist

  //   const playlistToSearch = body.slice(9); // play list <playlist name>, indexs just the playlist name
  //   cmd.run(`spotify play ${playlistToSearch}`);

  // }

  if (body.indexOf('play') > -1) {
    const songToSearch = body.match(/play(.+)/)[1].trim();
    const searchResults = await spotifyApi.searchTracks(songToSearch);
    // console.log(prettyjson.render(searchResults));
    const songToPlay = searchResults.body.tracks.items[0].name;
    cmd.run(`spotify play ${songToPlay}`);
  } // api.sendMessage(message.body, message.threadID);


}

async function init() {
  await initSpotify();
  // await getUser(config.spotifyUsername);
  api = await loginToFacebook();
  api.listen(listenFacebook);
}

async function initSpotify() {
  const { body } = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(body['access_token']);
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
