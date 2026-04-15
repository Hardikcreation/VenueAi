const { getPool } = require('../config/db');

const getStats = async (req, res) => {
  try {
    const [usersCount] = await getPool().query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [vendorsCount] = await getPool().query('SELECT COUNT(*) as count FROM vendors');
    const [productsCount] = await getPool().query('SELECT COUNT(*) as count FROM products');
    const [pendingCount] = await getPool().query('SELECT COUNT(*) as count FROM products WHERE status = "pending"');

    res.json({
      users: usersCount[0].count,
      vendors: vendorsCount[0].count,
      products: productsCount[0].count,
      pending: pendingCount[0].count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await getPool().query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const [vendors] = await getPool().query(
      `SELECT v.*, u.name, u.email 
       FROM vendors v 
       JOIN users u ON v.user_id = u.id 
       ORDER BY v.created_at DESC`
    );
    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await getPool().query('UPDATE products SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Product status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await getPool().query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, getAllUsers, getAllVendors, updateProductStatus, deleteUser };
