import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {pool} from '..db.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = async(req, res)=>{
     try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const organizationName = String(req.body.organizationName || '').trim();

    const errors = {};
    if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
    if (password.length < 6) errors.password = 'Use at least 6 characters.';
    if (!organizationName) errors.organizationName = 'Organization name is required.';
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Check the highlighted fields.', fields: errors });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'An account with this email already exists.', fields: { email: 'Already registered.' } });

    const hash = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [org] = await conn.query('INSERT INTO organizations (name) VALUES (?)', [organizationName]);
      const [user] = await conn.query(
        'INSERT INTO users (organization_id, email, password_hash) VALUES (?, ?, ?)',
        [org.insertId, email, hash]
      );
      await conn.commit();
      const u = { id: user.insertId, organization_id: org.insertId };
      res.status(201).json({
        success: true,
        message: 'Account created successfully. Now you can log in.',
        user: { id: u.id, email, organizationId: org.insertId, organizationName },
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) { 
    console.log('Signup error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
   }
}; 


export const login = async(req, res)=>{
     try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Enter your email and password.' });

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.organization_id, o.name AS organization_name
       FROM users u JOIN organizations o ON o.id = u.organization_id
       WHERE u.email = ?`, [email]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password, u.password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

       const token = jwt.sign({ id: u.id,organizationId: u.organization_id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.json({
        success: true,
        message: 'Login successful.',
        token,
      user: { id: u.id, organizationId: u.organization_id,   },
    });
  } catch (err) { 
      return res.status(500).json({
         success: false,
            error: 'Something went wrong. Please try again.',
      })
   }
}


