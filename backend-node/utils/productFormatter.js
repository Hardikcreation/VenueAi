// utils/productFormatter.js

const formatProduct = (product) => {
  if (!product) return null;

  return {
    ...product._doc, // convert mongoose document
    id: product._id, // normalize id for frontend
    _id: undefined   // optional: remove _id if you want clean response
  };
};

module.exports = { formatProduct };