import React from 'react';
import ReactDOM from 'react-dom';
import {autorun} from 'mobx';

import fetchTags from './fetch-tags';
import {renderTimeline} from './timeline';
import {renderMap} from './map';
import TracksTable from './tracks-table';
import tagStore from './tag-store';
import formatDate from './util/format-date';

import './index.css';

const reactRoot = document.getElementById('react-root');

const msgDiv = document.getElementById('msg');

const renderDateRange = () => {
  autorun(() => {
    const [startDate, endDate] = tagStore.getDateRange();
    msgDiv.innerHTML = `Showing tracks between ${formatDate(startDate)} - ${formatDate(endDate)}`;
  });
};

fetchTags().then((tags) => {
  tagStore.setTags(tags);

  renderDateRange();

  renderMap({
    onBoundsChanged: bounds => tagStore.setBounds(bounds),
  });

  renderTimeline({
    tags,
    selector: '.timeline-container',
    onDateRangeChanged: (startDate, endDate) => tagStore.setDateRange(startDate, endDate),
  });

  ReactDOM.render(
    <TracksTable tags={tags} store={tagStore} />,
    reactRoot,
  );
});
