import React from 'react';
import { observer } from 'mobx-react';
import './index.scss';

const DEFAULT_ALBUM_ART_URL = '/images/default_album_art.png';

const TracksTable = ({store}) => (
  <div className="tracks-table-wrapper">
    <ul className="tracks-table">
      {store.tagsInRange.get().map(({
        track: {
          key,
          heading: {
            title,
            subtitle,
          },
          images,
        },
      }, i) => (
        <li key={i}>
          <img src={images.default || DEFAULT_ALBUM_ART_URL} alt="Album cover" />
          <div className="track-title">
            {title}
          </div>
          <div className="track-artist">
            {subtitle}
          </div>
          <div className="clear" />
        </li>
      ))}
    </ul>
  </div>
);

TracksTable.propTypes = {
  store: React.PropTypes.object.isRequired, //eslint-disable-line
};

export default observer(TracksTable);
