/* eslint-disable arrow-body-style */

export default async () => {
  const response = await fetch('shazams.json');
  const data = await response.json();

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
};
