/* eslint-disable arrow-body-style */
/* global window: true */


// import * as d3 from 'd3';

// const fetchFileD3 = () => new Promise((resolve, reject) => {
//   d3.json('shazams.json', (error, data) => {
//     if (error) {
//       reject(error);
//     } else {
//       resolve(data);
//     }
//   });
// });

const API_PORT = 3001;
const PATH = '/shazams.json';

const fetchFileAPI = ({fbEmail, fbPass}) => {
  const location = window.location;
  const {
    protocol,
    hostname,
  } = location;
  const url = `${protocol}//${hostname}:${API_PORT}${PATH}?fbEmail=${fbEmail}&fbPass=${fbPass}`;

  return fetch(url)
    .then(res => res.json());
};

const filterUnnecessaryProperties = tags =>
  tags.map(({
    tagid,
    key,
    timestamp,
    timezone,
    geolocation,
    type,
    track: {
      heading,
      images,
    },
  }) => (
    {
      tagid,
      key,
      timestamp,
      timezone,
      geolocation,
      type,
      track: {
        heading,
        images,
      },
    }
  ));

export default function fetchTags({fbEmail, fbPass}) {
  // return fetchFileD3()
  return fetchFileAPI({fbEmail, fbPass})
    .then((data) => {
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

      return tags;
    })
    .then(filterUnnecessaryProperties);
}
