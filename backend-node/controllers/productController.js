const { getPool } = require('../config/db');
const { formatProduct } = require('../utils/productFormatter');

const getAllProducts = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT p.*, v.business_name, u.name as vendor_name 
      FROM products p 
      JOIN vendors v ON p.vendor_id = v.id 
      JOIN users u ON v.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR p.location LIKE ? OR p.occasion_types LIKE ? OR p.zone LIKE ? OR p.landmark LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC';

    const [products] = await getPool().query(query, params);
    res.json(products.map(formatProduct));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const [products] = await getPool().query(
      `SELECT p.*, v.business_name, u.name as vendor_name 
       FROM products p 
       JOIN vendors v ON p.vendor_id = v.id 
       JOIN users u ON v.user_id = u.id 
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(formatProduct(products[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllProducts, getProductById };
