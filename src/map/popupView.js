import './popupView.css';

const DEFAULT_IMAGE = {
  default: 'https://images.shazam.com/coverart/t312411681_s400.jpg',
};

const popupView = (tag) => {
  const {tagid, track} = tag;
  const {heading} = track;
  const {title, subtitle} = heading;
  const images = track.images || DEFAULT_IMAGE;

  return `
    <div class="track-container" data-img="${images.default}" data-tag-id="${tagid}">
      <h3>
        <a class="track-title" target="_blank">
          ${title}
        </a>
      </h3>
      <h4>${subtitle}</h4>
    </div>
  `;
};

export default popupView;
