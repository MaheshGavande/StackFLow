import {pool} from '../db.js';

export const getSettings = async (req, res) => {
    try {
    const [rows] = await pool.query(
      'SELECT name, default_low_stock_threshold AS defaultLowStockThreshold FROM organizations WHERE id = ?',
      [req.user.organizationId]);
    res.json({ settings: rows[0] });
  } catch (err) { 
    console.log('Settings error:', err);
    return res.status(500).json({
     success: false,
        error: 'Something went wrong. Please try again.',
   })
  }
}


export const updateSettings = async (req, res) => {
     try {
    const raw = Number(req.body.defaultLowStockThreshold);
    const value = Number(raw);
    if (raw === '' || raw === null || raw === undefined ||!Number.isInteger(value) || value < 0) {
      return res.status(400).json({ error: 'Check the highlighted fields.', fields: { defaultLowStockThreshold: 'Use a whole number, 0 or more.' } });
    }
    await pool.query('UPDATE organizations SET default_low_stock_threshold = ? WHERE id = ?', [value, req.user.organizationId]);
    res.json({ settings: { defaultLowStockThreshold: value } });
  } catch (err) { 
    console.log('Update settings error:', err);
    return res.status(500).json({
     success: false,
        error: 'Something went wrong. Please try again.'});
    } 
    
   }
