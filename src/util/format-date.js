const formatDate = (d) => {
  const date = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();

  return `${date}/${month}/${year} - ${hours}:${(minutes < 10 ? '0' : '') + minutes}`;
};

export default formatDate;
