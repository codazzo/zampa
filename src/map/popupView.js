import './popupView.css';

const DEFAULT_IMAGE = '/images/default_album_art.png';

const popupView = (tag) => {
  const {tagid, track} = tag;
  const {heading} = track;
  const {title, subtitle} = heading;
  const images = (track.images && track.images.default) || DEFAULT_IMAGE;

  return `
    <div class="track-container" data-img="${images}" data-tag-id="${tagid}">
      <h3>
        <a class="track-title" target="_blank">
          ${title}
        </a>
      </h3>
      <h4>${subtitle}</h4>
      <span class="play-video">
        ▶
      </span>
    </div>
  `;
};

export default popupView;
