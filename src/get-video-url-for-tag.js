const getYoutubeURLFromID = id => `https://www.youtube.com/watch?v=${id}`;

// const fetchResponseFromLocalProxy = (videosUrl) => {
//   const path = videosUrl.split('cdn.shazam.com/')[1];
//   const proxiedUrl = `http://localhost:3001/${path}`;
//   return fetch(proxiedUrl)
//     .then(res => res.json());
// };

const fetchResponseFromRemoteProxy = (videosUrl) => { // eslint-disable-line no-unused-vars
  const proxiedUrl = `https://jsonp.afeld.me/?callback=?&url=${videosUrl}`;
  return fetch(proxiedUrl)
    .then(res => res.text())
    .then((res) => {
      const json = res.substr(2, res.length - 4);
      return JSON.parse(json);
    });
};

export default function getVideoUrlForTag(tag) {
  const videosUrl = tag.track.content.videos.href;

  return fetchResponseFromRemoteProxy(videosUrl)
    .then((obj) => {
      const videos = obj.youtube.videos;
      const firstVideo = videos[0];

      return getYoutubeURLFromID(firstVideo.id);
    });
}
