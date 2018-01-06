/* globals L: true */

import {extendObservable, computed} from 'mobx';

class TagStore {
  constructor() {
    extendObservable(this, {
      tags: [],
      startDate: -Infinity,
      endDate: +Infinity,
      bounds: null,
      selectedTag: null,
    });
  }

  get tagsInRange() {
    const startTimestamp = +this.startDate;
    const endTimestamp = +this.endDate;

    // TODO this could just assume sorting and use filtering or `for`
    return computed(
      () => this.tags.reduce((list, tag) => {
        const {timestamp} = tag;
        const isInTimeRange = timestamp >= startTimestamp && timestamp < endTimestamp;
        let isInRange;

        if (!this.bounds) {
          isInRange = isInTimeRange;
        } else if (tag.geolocation) {
          const {longitude, latitude} = tag.geolocation;
          isInRange = isInTimeRange && this.bounds.contains(L.latLng(latitude, longitude));
        } else {
          // there are bounds, but the track has no geolocation info. not in range.
          isInRange = false;
        }

        return list.concat(isInRange ? tag : []);
      }, []) // eslint-disable-line comma-dangle
    );
  }

  setBounds(bounds) {
    this.bounds = bounds;
  }

  setSelectedTag(tagId) {
    this.selectedTag = this.tags.find(({tagid}) => tagid === tagId);
  }

  setDateRange(startDate, endDate) {
    Object.assign(this, {startDate, endDate});
  }

  addTag(tag) {
    this.tags.push(tag);
  }

  setTags(tags) {
    this.tags = tags.reverse();
    const timestamps = tags.map(({timestamp}) => timestamp);
    Object.assign(this, {
      startDate: new Date(Math.min.apply(null, timestamps)),
      endDate: new Date(Math.max.apply(null, timestamps)),
    });
  }

  getDateRange() {
    return [this.startDate, this.endDate];
  }

  findTagById(tagId) {
    return this.tags.find(({tagid}) => tagid === tagId);
  }
}

export default new TagStore();
