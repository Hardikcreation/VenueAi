// utils/seedAdmin.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        const existing = await User.findOne({ email: 'admin@venue.ai' });

        if (!existing) {
            const hashedPassword = await bcrypt.hash('admin@123', 10);

            await User.create({
                name: 'Admin',
                email: 'admin@venue.ai',
                password: hashedPassword,
                role: 'admin'
            });

            console.log('✅ Admin created');
        } else {
            console.log('ℹ️ Admin already exists');
        }
    } catch (error) {
        console.error('❌ Admin seed error:', error.message);
    }
};

module.exports = seedAdmin;