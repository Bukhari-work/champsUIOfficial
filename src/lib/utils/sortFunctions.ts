// sort by date
export const sortByDate = (array: any[]) => {
  return [...array].sort((a: any, b: any) => {
    const dateA = a.data.date ? new Date(a.data.date).valueOf() : 0;
    const dateB = b.data.date ? new Date(b.data.date).valueOf() : 0;
    return dateB - dateA;
  });
};

// sort product by weight
export const sortByWeight = (array: any[]) => {
  const withWeight = array.filter(
    (item: { data: { weight: any } }) => item.data.weight,
  );
  const withoutWeight = array.filter(
    (item: { data: { weight: any } }) => !item.data.weight,
  );
  const sortedWeightedArray = withWeight.sort(
    (a: { data: { weight: number } }, b: { data: { weight: number } }) =>
      a.data.weight - b.data.weight,
  );
  const sortedArray = [...new Set([...sortedWeightedArray, ...withoutWeight])];
  return sortedArray;
};
