const login = require('facebook-chat-api');
const prettyjson = require('prettyjson');
const config = require('./config.json');
const cmd = require('node-cmd');
// remember to brew install shoptify
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId : config.spotifyid,
  clientSecret : config.spotifysecret
});
let api;

function prettyConsole(data) {
  console.log(prettyjson.render(data));
}

var queue_array = [];
var pausedFromMessage = true;


async function listenFacebook(err, message) {
  //checkThreadPlaylist(message.threadID);

  
  // cmd.run(message.body);
  var { body } = message;
  // should maybe make it all lowercase so that auto capitalization doesn't break it
  var body = body.toLowerCase();




  if (body.indexOf('play') > -1) { // has the word play
    //const songToSearch = body.match(/play(.+)/)[1].trim();
    const songToSearch = body.split("play ")[1];
    //console.log(`Song to search: ${songToSearch}`);
    const searchResults = await spotifyApi.searchTracks(songToSearch);
    if (searchResults) {
      const songToPlay = searchResults.body.tracks.items[0].uri;
      //console.log(`Song to play: ${songToPlay}`);
      //console.log(searchResults.body.tracks.items[0]);
      cmd.run(`spotify play uri ${songToPlay}`);
    }
    else {
login({email: config.login, password: config.password}, function callback (err, api) {
    if(err) return console.error(err);

    var yourID = 1626794548;
    var msg = {body: "Sorry, that song doesn\'t exist"};
    api.sendMessage(msg, yourID);
});
    }

  }

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

  else if (body.indexOf('unpause') > -1) { // plays the next song

    cmd.run(`spotify play`);
  }

  else if (body.indexOf('next') > -1) { // plays the next song
    cmd.run(`spotify next`);
  }

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

login({email: config.login, password: config.password}, function callback (err, api) {
    if(err) return console.error(err);

    var yourID = 1626794548;
    var msg = {body: "Hey! My name is Spotify Bot and I'm here to help you control your music! To play a song tell me to \"play <songname>\". To queue a song (add it to up next) tell me to \"queue <songname>\". I can also handle playlist links! Have fun 🎵"};
    api.sendMessage(msg, yourID);
});

login({email: config.login, password: config.password}, function callback (err, api) {
    if(err) return console.error(err);

    api.setOptions({listenEvents: true});

    var stopListening = api.listen(function(err, event) {
        if(err) return console.error(err);

        switch(event.type) {
          case "message":
            if(event.body === '/stop') {
              api.sendMessage("Goodbye...", event.threadID);
              return stopListening();
            }
            api.markAsRead(event.threadID, function(err) {
              if(err) console.log(err);
            });
            api.sendMessage("Sure, I'll " + event.body, event.threadID);
            break;
          case "event":
            console.log(event);
            break;
        }
    });
});

init();
