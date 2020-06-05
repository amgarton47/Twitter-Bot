const fs = require("fs");
const axios = require("axios");
const config = require("./config"); // our twitter api credentials
const giphy_key = require("./giphy-api-key"); // our giphy api credentials

const quotesData = require("./quotes"); // locally stored json data of quotes

const Twit = require("twit");
const download = require("image-downloader"); // lets us locally download gifs
const T = new Twit(config);

// format json data to our desired quote format, replacing empty authors with 'Anonymous'
const quotes = quotesData.map(quoteObj => {
  if (quoteObj["quoteAuthor"] === "") {
    return `"${quoteObj["quoteText"]}" - Anonymous`;
  }
  return `"${quoteObj["quoteText"]}" -${quoteObj["quoteAuthor"]}`;
});

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

// this function will post a tweet with our gif located locally "gifs/giphy.gif"
// it has param 'caption' that corresponds to the posted tweet's caption
function postMediaTweet(caption) {
  var b64content = fs.readFileSync("gifs/giphy.gif", { encoding: "base64" });

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
            if (!err) {
              console.log("MEDIA POST SUCCESFUL");
            } else {
              console.log(err);
            }
          });
        } else {
          console.log(err);
        }
      });
    }
  );
}

// this function starts our promise chain
// first get the random gif url from the giphy endpoint
// then download that gif locally to "gifs/giphy.gif"
// then post that gif to twitter with our randomly selected quote as the caption
function getGifUrl() {
  axios
    .get(`http://api.giphy.com/v1/gifs/random?api_key=${giphy_key}&limit=1`)
    .then(result => {
      console.log(result.data.data.image_url);
      downloadGif(result.data.data.image_url);
    })
    .catch(error => {
      console.log(error);
    });
}

// downloads an image locally to "gifs/giphy.gif" given the image url
function downloadGif(imageUrl) {
  const options = {
    url: imageUrl,
    dest: "gifs/giphy.gif",
  };

  download
    .image(options)
    .then(({ filename }) => {
      console.log("Saved to", filename);
      postMediaTweet(quotes[Math.floor(Math.random() * quotes.length)]);
    })
    .catch(err => console.error(err));
}

// make a post right at run-time, then make a post every 4 hours
getGifUrl();
setInterval(getGifUrl, 1000 * 60 * 60 * 4);
