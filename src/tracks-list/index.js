import React from 'react';
import { observer } from 'mobx-react';
import './index.scss';
import formatDate from '../util/format-date';

const DEFAULT_ALBUM_ART_URL = '/images/default_album_art.png';

const TracksList = ({store}) => (
  <div className="tracks-list-wrapper">
    <ul className="tracks-list">
      {store.tagsInRange.get().map(({
        timestamp,
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
          <div className="tag-timestamp">
            {formatDate(new Date(timestamp))}
          </div>
          <div className="clear" />
        </li>
      ))}
    </ul>
  </div>
);

TracksList.propTypes = {
  store: React.PropTypes.object.isRequired, //eslint-disable-line
};

export default observer(TracksList);
