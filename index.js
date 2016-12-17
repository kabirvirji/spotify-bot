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
var queue_array = [];
var pausedFromMessage = true;


async function listenFacebook(err, message) {
  //checkThreadPlaylist(message.threadID);

  
  // cmd.run(message.body);
  var { body } = message;
  // should maybe make it all lowercase so that auto capitalization doesn't break it
  var body = body.toLowerCase();


  if (body.indexOf('play song') > -1) { // has the word play
    //const songToSearch = body.match(/play(.+)/)[1].trim();
    const songToSearch = body.split("song ")[1];
    console.log(`Song to search: ${songToSearch}`);
    const searchResults = await spotifyApi.searchTracks(songToSearch);
    const songToPlay = searchResults.body.tracks.items[0].uri;
    console.log(`Song to play: ${songToPlay}`);
    console.log(searchResults.body.tracks.items[0]);
    cmd.run(`spotify play uri ${songToPlay}`);
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
    
    //const songToQueue = searchResultsforQueue.body.tracks.items[0].uri;
    queue_array.push(songToQueue);
    console.log(queue_array);

  }

  else if (body.indexOf('pause') > -1) { // plays the next song
    pausedFromMessage = false;
    clearInterval(myInterval);
    cmd.run(`spotify pause`);
  }

  else if (body.indexOf('play') > -1) { // plays the next song

    cmd.run(`spotify play`);
  }

  else if (body.indexOf('next') > -1) { // plays the next song
    cmd.run(`spotify next`);
  }



var myInterval = setInterval(function() {

  cmd.get(
    'spotify status',
    function(data) {
      console.log(data);
      console.log(data.includes('paused')); // bool
      if (data.includes('paused') && pausedFromMessage) {
        console.log(`The song is paused, so I'll play: ${queue_array}`);
        cmd.run('spotify play uri ' + queue_array[0]);
        queue_array.shift();
        console.log(`After plaything queued song, the array looks like this: ${queue_array}`);
      }
    }
  )


}, 
1000);






  // cmd.get('spotify status') to get position of song ie) Position: 0:17 / 2:30 (check docs for the cmd function)
  // turn that into a percentage, or something to make sure the song is complete
  // THEN play the next song in the array

  // could also just get the time from spotify status and compare with the time from the search results (which is in ms, will need to convert)
  // the following converts ms to minute:second format
  // var ms = 171373,
  //    min = (ms/1000/60) << 0,
  //    sec = ((ms/1000) % 60).toFixed(0);


  // alert(min + ':' + sec);
  // the call to get ms of the song is searchResults.body.tracks.items[0].duration_ms;


  /*

  Have an if statement for song between one and three seconds where x is the difference in times
  2.5 / 3.68
  var x = 3.68 - 2.5
   if (1 < x < 3)
    STOP THE INTERVAL FUNCTION
    WAIT x SECONDS
    THEN PLAY NEXT SONG

  */


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