const express = require('express');
const app = express();
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client();
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const { YouTube }= require('better-youtube-api')
const youtube = new YouTube("config.youtube")
const download = require('image-downloader');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

app.use(express.static('public'));
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
let Twitter = require('node-tweet-stream')
//go to config.json and fill out the twitter api key
, twstream = new Twitter({
  consumer_key: config.key,
  consumer_secret: config.keysecret,
  token: config.token,
  token_secret: config.tokensecret
})
const twitter = require('twitter');
const client = new twitter({
  consumer_key: config.key,
  consumer_secret: config.keysecret,
  access_token_key: config.token,
  access_token_secret: config.tokensecret
});
bot.on('message', (message) => {
  if (message.content.startsWith(config.prefix)) {
    //slices args and command away from prefix
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    console.log(command);
    console.log(args)
    var imageurl;
    let pewds;
    let tseries1;
    let winner;
    if (command == "start") {
      //retweet pewdiepie tweets
      twstream.track('pewdiepie')
      var alreadytweeted = false;
      twstream.on('tweet', function (tweet) {
        let connotation =sentiment.analyze(tweet.text)
        message.channel.send("Pewds tweet found. Connotation: "+connotation.score)
        if (!alreadytweeted && connotation.score>=0) {
          //retweet code goes here
          alreadytweeted = true;
          setTimeout(gay=> {alreadytweeted=false},60000)
        }
      })
      function start () {
        message.channel.send("Checking sub stats");
        let pewds;
        let tseries1;
        async function main() {
          const [pewdiepie, tseries] = await Promise.all([
            youtube.getChannel('UC-lHJZR3Gqxm24_Vd_AJ5Yw'),
            youtube.getChannel('UCq-Fj5jknLsUf-MWSy4_brA')
          ]);
          return [pewdiepie, tseries]
        }
        main().then(returned => {
          pewds = returned[0].data.statistics.subscriberCount
          tseries1 = returned[1].data.statistics.subscriberCount
          if (pewds>tseries1) {
            imageurl = "https://cdn.glitch.com/9ea7e06e-6c92-408c-9c8c-76b20099cbe9%2Fimage.png?1550251641794"
            winner = "Pewdiepie";
          }else {
            imageurl = "https://vignette.wikia.nocookie.net/youtube/images/3/38/T-series-logo.png/revision/latest?cb=20181203012837"
            winner = "T-series";
          }
        });
        setTimeout(post=>{
          const options = {
            url: imageurl,
            dest: 'randimage.jpg'                  
          }
          download.image(options).then(({ filename, image }) => {
            console.log('File saved to'+ filename)
            //--
            console.log("test")
            client.post('media/upload', {media: image}, function(error, media, response) {
              console.log(error)
              if (!error) {
                // If successful, a media object will be returned.
                console.log(media);
                // Lets tweet it
                var status = {
                  status: "Live sub count: Pewdiepie vs T-Series\n"+winner+" is winning by "+Math.abs(pewds-tseries1)+" subs\nPewdiepie has "+pewds+" subs\nT-Series has "+tseries1 + " subs\n",
                  media_ids: media.media_id_string // Pass the media id string
                }
                client.post('statuses/update', status, function(error, tweet, response) {
                  if (!error) {
                    console.log(tweet);
                    message.channel.send("Live sub count: Pewdiepie vs T-Series\n"+winner+" is winning by "+Math.abs(pewds-tseries1)+" subs\nPewdiepie has "+pewds+" subs\nT-Series has "+tseries1 + " subs\n" + "\n"+imageurl)
                  }
                });
              }
            });
            //--
          })   
        },10000)
      }
      //checks status of pewdsvstseries and tweets every hour
      start();
      setInterval(start,3600000)
    }
  };
});
bot.login(config.dtoken);
