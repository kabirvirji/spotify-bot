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

// Trying to get an intro message at beginning of conversation, or when it is added to a group

// login({email: "", password: ""}, function callback (err, api) {
//     if(err) return console.error(err);

//     var yourID = "100014215535982";
//     var msg = {body: "Hey!"};
//     api.sendMessage(msg, yourID);
//     console.log(msg);
// });

// For creating playlists for groups

// async function checkThreadPlaylist(threadID) {
//   const playlists = await spotifyApi.getUserPlaylists(config.spotifyUsername);
//   prettyConsole(playlists);
// }

// async function getUser(username) {
//   prettyConsole(await spotifyApi.getUser(username));
// }

async function listenFacebook(err, message) {
  //checkThreadPlaylist(message.threadID);

  var queue_array = [];
  
  // cmd.run(message.body);
  const { body } = message;

  if (body.indexOf('play song') > -1) { // has the word play
    //const songToSearch = body.match(/play(.+)/)[1].trim();
    const songToSearch = body.split("song ")[1];
    console.log(`song to search: ${songToSearch}`);
    const searchResults = await spotifyApi.searchTracks(songToSearch);
    const songToPlay = searchResults.body.tracks.items[0].name;
    console.log(`song to play: ${songToPlay}`);
    console.log(searchResults.body.tracks);
    cmd.run(`spotify play ${songToPlay}`);
  } // api.sendMessage(message.body, message.threadID);

  else if (body.indexOf('https://open.spotify.com/user') > -1 ) { // is a spotify playlist link

    const playlistIdentifier = body.split("playlist/")[1]; // grabs the unique playlist identifier
    console.log(`playing spotify:user:kabirvirji:playlist:${playlistIdentifier}`);
    cmd.run(`spotify play uri spotify:user:kabirvirji:playlist:${playlistIdentifier}`);

  }

  else if (body.indexOf('queue') > -1) { // has the word queue

    const songToSearchforQueue = body.split("queue ")[1]; // takes just the song name eg. "queue songname" will just take songname
    const searchResultsforQueue = await spotifyApi.searchTracks(songToSearchforQueue); // search results like before
    const songToQueue = searchResultsforQueue.body.tracks.items[0].uri; // index at URI instread of name like before
    queue_array.push(songToQueue);

  }

  else if (body.indexOf('next') > -1) {
    cmd.run(`spotify next`);
  }

  for (i = 0; i < queue_array.length; i++) { 
    // need something to figure out if a song is done or not. queue <songname> plays the song right away 
    cmd.run('spotify play uri ' + queue_array[i]);
  }


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
