/* eslint-disable arrow-body-style */

import * as d3 from 'd3';

export default function fethcTags() {
  return new Promise((resolve, reject) => {
    d3.json('shazams.json', (error, data) => {
      if (error) {
        return reject(error);
      }

      const startTimestamp = Date.now();

      const tags = data.tags
              .sort((a, b) => { // sort tags in increasing chronological order
                return a.timestamp > b.timestamp ? +1 : -1;
              })
              .reduce((acc, tag) => { // filter tracks shazammed more than once in succession
                return acc.concat(acc.length && tag.key === acc[acc.length - 1].key ? [] : tag);
              }, []);

      const endTimestamp = Date.now();

      console.log(`time elapsed building tracks array: ${endTimestamp - startTimestamp}ms`);

      return resolve(tags);
    });
  });
}
