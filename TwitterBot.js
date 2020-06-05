const Twit = require("twit");
const config = require("./config");
const T = new Twit(config);

// this function will post a tweet with 'tweetContent' as its text
function postTweet(tweetContent) {
  let content = { status: `${tweetContent}` };

  T.post("statuses/update", content, function (err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(`Your tweet "${data.text}" was succesfully tweeted!`);
    }
  });
}

postTweet("This is a Twitter Bot!");
