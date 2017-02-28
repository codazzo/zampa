/* globals L: true */

import $ from 'jquery';
import {autorun} from 'mobx';
import popupView from './popupView';
import getVideoUrlForTag from '../get-video-url-for-tag';
import tagStore from '../tag-store';

import './index.css';

let USE_CLUSTERING = true; // FIXME use observable
let map;
let markers = [];

const getMarkersFromTags = tags => tags.map((tag) => {
  const {geolocation} = tag;

  if (!(geolocation && geolocation.longitude && geolocation.latitude)) {
    return null;
  }

  const {longitude, latitude} = geolocation;

  return L.marker([latitude, longitude]).bindPopup(popupView(tag));
})
.filter(Boolean);

const getMarkers = (tags) => {
  const tagMarkers = getMarkersFromTags(tags);

  if (USE_CLUSTERING) {
    const clusterGroup = L.markerClusterGroup();
    tagMarkers.forEach(marker => clusterGroup.addLayer(marker));
    return [clusterGroup];
  }

  return tagMarkers;
};

const updateMap = (tags) => {
  markers.forEach(marker => map.removeLayer(marker));
  markers = getMarkers(tags);
  markers.forEach(marker => map.addLayer(marker));
};

const addClusterControl = () => {
  const clusterControl = L.control({position: 'topright'});
  clusterControl.onAdd = () => {
    const div = L.DomUtil.create('div', 'command');

    div.innerHTML = `
      <form class="cluster-control">
        <input id="command" type="checkbox" ${USE_CLUSTERING ? 'checked' : ''}/>
        <label for="command">cluster</label>
      </form>`;

    return div;
  };

  clusterControl.addTo(map);

  document.getElementById('command').addEventListener('click', () => {
    USE_CLUSTERING = !USE_CLUSTERING;
    updateMap();
  });
};

export const renderMap = ({onBoundsChanged = () => {}}) => { //eslint-disable-line
  map = L.map('map', {
    minZoom: 1,
    maxBounds: L.latLngBounds(L.latLng(-180, -180), L.latLng(180, 180)),
    maxBoundsViscosity: 1.0,
  })
  .setView([0, 0], 1);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    noWrap: true,
  }).addTo(map);

  map.on('popupopen', (e) => {
    const $wrapper = $(e.popup._wrapper); // eslint-disable-line no-underscore-dangle
    const $container = $wrapper.find('.track-container');
    const $titleAnchor = $container.find('.track-title');

    const imgUrl = $container.data('img');
    const tagId = $container.data('tagId');
    $wrapper.css({
      'background-image': `url(${imgUrl})`,
    });

    const tag = tagStore.findTagById(tagId);

    getVideoUrlForTag(tag).then((url) => {
      $titleAnchor.attr('href', url);
    });
  });

  map.on('zoomend dragend', () => {
    onBoundsChanged(map.getBounds());
  });

  addClusterControl(map);

  autorun(() => {
    const tagsInRange = tagStore.tagsInRange.get();
    updateMap(tagsInRange);
  });
};
