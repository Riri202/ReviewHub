const mongooseDocsToObjects = (docs) => {
  const tempArray = [];
  if (!docs.length) return;
  docs.forEach((doc) => {
    tempArray.push(doc.toObject());
  });
  return tempArray;
};

const isAdmin = (user) => user.role === 'admin'

module.exports = {
    mongooseDocsToObjects,
    isAdmin
}