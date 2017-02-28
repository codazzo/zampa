import React from 'react';
import { observer } from 'mobx-react';
import './index.scss';

const TracksTable = ({store}) => (
  <div className="tracks-table-wrapper">
    <table className="tracks-table">
      <tbody>
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
          <tr key={i}>
            <td>
              <img src={images.default} alt="Album cover" />
              {title}
              <br />
              {subtitle}
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

TracksTable.propTypes = {
  store: React.PropTypes.object.isRequired, //eslint-disable-line
};

export default observer(TracksTable);
