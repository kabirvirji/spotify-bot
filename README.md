# Spotify Messenger Bot

With this bot you'll be able to control Spotify through Facebook Messenger. <br><br>
Although each bot is linked to a specific user, anyone can message the bot and it can be added to group chats. <br>
This makes it great for parties and events because anyone can play a song! <br>

## [Watch the Demo](https://www.youtube.com/watch?v=ALJ9VN21ecA)

## requirments

- Node.js
- Homebrew
- Spotify account
- Alternate Facebook account

## usage

First start by creating an alternate Facebook account for the bot. <br>
This is the account you will be interacting with.

1. `git clone https://github.com/kabirvirji/spotify-bot.git`
2. `npm install`
3. `brew install shpotify`
4. Generate Spotify API keys at [https://developer.spotify.com/my-applications](https://developer.spotify.com/my-applications)
5. Create a config.json after generating Spotify API keys

```
{
  "login": "",
  "password":"",
  "spotifyid": "",
  "spotifysecret": "",
  "username": ""
}
```

6. `npm start`
7. Start playing music!


