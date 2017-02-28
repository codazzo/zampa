/* globals L: true */

import $ from 'jquery';
import {autorun, observable} from 'mobx';
import popupView from './popupView';
import getVideoUrlForTag from '../get-video-url-for-tag';
import tagStore from '../tag-store';

import './index.css';

const USE_CLUSTERING_INITIALLY = true;
const SIZE_AROUND_SELECTED_TAG_IN_METERS = 5;

let markers = [];

const getMarkersFromTags = tags => tags.map((tag) => {
  const {tagid, geolocation} = tag;

  if (!(geolocation && geolocation.longitude && geolocation.latitude)) {
    return null;
  }

  const {longitude, latitude} = geolocation;

  const marker = L.marker([latitude, longitude]).bindPopup(popupView(tag));
  marker.tagid = tagid;

  return marker;
})
.filter(Boolean);

const updateMap = (map, tags, useClustering) => {
  map.eachLayer((layer) => {
    if (layer === map.tileLayer) {
      return;
    }
    map.removeLayer(layer);
  });

  markers = getMarkersFromTags(tags);

  if (useClustering) {
    const clusterGroup = L.markerClusterGroup();
    markers.forEach(marker => clusterGroup.addLayer(marker));
    map.addLayer(clusterGroup);
    map.clusterGroup = clusterGroup; // eslint-disable-line no-param-reassign
    return;
  }

  markers.forEach(marker => map.addLayer(marker));
};

const addClusterControl = (map, useClusteringBoxed) => {
  const clusterControl = L.control({position: 'topright'});
  clusterControl.onAdd = () => {
    const div = L.DomUtil.create('div', 'command');

    div.innerHTML = `
      <form class="cluster-control">
        <input id="command" type="checkbox" ${useClusteringBoxed.get() ? 'checked' : ''}/>
        <label for="command">cluster</label>
      </form>`;

    return div;
  };

  clusterControl.addTo(map);

  document.getElementById('command').addEventListener('click', () => {
    useClusteringBoxed.set(!useClusteringBoxed.get());
  });
};

export const renderMap = ({onBoundsChanged = () => {}}) => { //eslint-disable-line
  const map = L.map('map', {
    minZoom: 1,
    maxZoom: 18,
    maxBounds: L.latLngBounds(L.latLng(-180, -180), L.latLng(180, 180)),
    maxBoundsViscosity: 1.0,
  })
  .setView([0, 0], 1);

  map.tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    noWrap: true,
  }).addTo(map);

  map.on('popupopen', (e) => {
    const $wrapper = $(e.popup._wrapper);
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

  const useClustering = observable(USE_CLUSTERING_INITIALLY);

  addClusterControl(map, useClustering);

  autorun(() => {
    const tagsInRange = tagStore.tagsInRange.get();
    updateMap(map, tagsInRange, useClustering.get());
  });

  autorun(() => {
    const selectedTag = tagStore.selectedTag;

    if (!selectedTag || !selectedTag.geolocation) {
      return;
    }

    const {latitude, longitude} = selectedTag.geolocation;
    const center = L.latLng(latitude, longitude);
    const bounds = center.toBounds(SIZE_AROUND_SELECTED_TAG_IN_METERS);
    map.fitBounds(bounds);

    const markerForTag = markers.find(({tagid}) => tagid === selectedTag.tagid);
    const isUsingClustering = useClustering.get();

    if (isUsingClustering) {
      map.clusterGroup.zoomToShowLayer(markerForTag, () => {
        markerForTag.openPopup();
      });
    } else {
      markerForTag.openPopup();
    }
  });
};
