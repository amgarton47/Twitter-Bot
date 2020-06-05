const Twit = require("twit");
const config = require("./config");
const T = new Twit(config);
const fs = require("fs");

const axios = require("axios");

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

// post a tweet with media
function postMediaTweet(caption) {
  var b64content = fs.readFileSync(
    "/Users/aidangarton/Desktop/Code/TwitterBot/Robots-Square.jpg",
    { encoding: "base64" }
  );

  // first we must post the media to Twitter
  T.post(
    "media/upload",
    {
      media_data: b64content,
    },
    function (err, data, response) {
      // now we can assign alt text to the media, for use by screen readers and
      // other text-based presentations and interpreters
      var mediaIdStr = data.media_id_string;
      var altText =
        "Small flowers in a planter on a sunny balcony, blossoming.";
      var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

      T.post("media/metadata/create", meta_params, function (
        err,
        data,
        response
      ) {
        if (!err) {
          let tweetCaption = caption || "loving life #nofilter";
          // now we can reference the media and post a tweet (media will attach to the tweet)
          var params = {
            status: tweetCaption,
            media_ids: [mediaIdStr],
          };

          T.post("statuses/update", params, function (err, data, response) {
            console.log("MEDIA POST SUCCESFUL");
          });
        }
      });
    }
  );
}
