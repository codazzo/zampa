const getYoutubeURLFromID = id => `https://www.youtube.com/watch?v=${id}`;

export default function getVideoUrlForTag(tag) {
  const videosUrl = tag.track.content.videos.href;
  const proxiedUrl = `https://jsonp.afeld.me/?callback=?&url=${videosUrl}`;

  return fetch(proxiedUrl)
    .then(res => res.text())
    .then((res) => {
      const json = res.substr(2, res.length - 4);
      const obj = JSON.parse(json);
      const videos = obj.youtube.videos;
      const firstVideo = videos[0];

      return getYoutubeURLFromID(firstVideo.id);
    });
}
