import { pool } from '../db.js';
 


export const getProfile = async (req, res) => {
try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.organization_id, o.name AS organization_name
       FROM users u JOIN organizations o ON o.id = u.organization_id
       WHERE u.id = ? AND u.organization_id = ?`, [req.user.id, req.user.organizationId]);
    if (!rows[0]) return res.status(401).json({ error: 'Account not found.' });
    const u = rows[0];
    res.json({ 
        success: true,
        user: { id: u.id, email: u.email, organizationId: u.organization_id, organizationName: u.organization_name } });
  } catch (err) { 
    console.log('Profile error:', err);
    return res.status(500).json({ 
        success: false,
        error: 'Something went wrong. Please try again.' });
   }
}