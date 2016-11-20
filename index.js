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
    console.log(searchResultsforQueue);
    //const songToQueue = searchResultsforQueue.body.tracks.items[0].uri;
    queue_array.push(songToQueue);

  }

  else if (body.indexOf('next') > -1) { // plays the next song
    cmd.run(`spotify next`);
  }


setInterval(function() {

  cmd.get(
    'spotify status',
    function(data) {
      var x = 5;
      var position = data.split("Position: ")[1];
      var position_two = data;
      console.log(position);
      // now we have just: 3:46 / 3:46
      if (typeof position !== 'undefined') {
        var positionArray = position.split(' / '); // positionArray or position is not defined ?????
        // [ '3:46', '3:46' ] when song time is up
        var time = positionArray[1]; // second element in array
        var new_time_two = time.replace("\n", ""); // get rid of the newline character
        var new_time_two_two = new_time_two.replace(":", "."); // convert the time 3:46 to 3.46
        var time_zero = positionArray[0]; // first element in array
        var new_time_one = time_zero.replace(":", "."); // convert to str float
        var finalOne = Number(new_time_one);
        var finalTwo = Number(new_time_two_two);
        var finalOnetoCompare = finalOne + 0.01;
        console.log(`Time of song: ${finalOne} ${finalTwo}`);
      }
      else if (typeof position_two !== 'undefined') { // spotify is paued, so play the next song
        cmd.run('spotify play uri ' + queue_array[0]); // play the first song in the array
        queue_array.shift(); // remove first element in array
      }

      // *****
      // looks like position is undefined when the song is paused. when the song is paused the shell looks like this:
      // ~ spotify status
      // Spotify is currently paused.
      // wrote an else if to deal with if that is the response from 'spotify status'


        if ((finalOne+0.01) == finalTwo) {
          //if (positionArray[0] == new_time) {
            // if the two elements in the array match each other then the song is finished
            cmd.run('spotify play uri ' + queue_array[0]); // play the first song in the array
            queue_array.shift(); // remove first element in array
          //}
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
