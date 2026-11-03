import {pool} from '../db.js';

const SELECT = `
  SELECT p.id, p.name, p.sku, p.description,
         p.quantity_on_hand AS quantityOnHand,
         p.cost_price AS costPrice,
         p.selling_price AS sellingPrice,
         p.low_stock_threshold AS lowStockThreshold,
         COALESCE(p.low_stock_threshold, o.default_low_stock_threshold) AS effectiveThreshold,
         (p.quantity_on_hand <= COALESCE(p.low_stock_threshold, o.default_low_stock_threshold)) AS isLowStock,
         p.created_at AS createdAt, p.updated_at AS updatedAt
  FROM products p
  JOIN organizations o ON o.id = p.organization_id`;

const shape = (r) => ({ ...r, isLowStock: Boolean(r.isLowStock) });

const blankToNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

function parseBody(body) {
  const errors = {};
  const name = String(body.name ?? '').trim();
  const sku = String(body.sku ?? '').trim();
  if (!name) errors.name = 'Name is required.';
  if (!sku) errors.sku = 'SKU is required.';

  const quantity = body.quantityOnHand === '' || body.quantityOnHand == null ? 0 : Number(body.quantityOnHand);
  if (!Number.isInteger(quantity) || quantity < 0) errors.quantityOnHand = 'Use a whole number, 0 or more.';

  const cost = blankToNull(body.costPrice);
  if (cost !== null && (Number.isNaN(cost) || cost < 0)) errors.costPrice = 'Enter a valid price.';
  const sell = blankToNull(body.sellingPrice);
  if (sell !== null && (Number.isNaN(sell) || sell < 0)) errors.sellingPrice = 'Enter a valid price.';
  const threshold = blankToNull(body.lowStockThreshold);
  if (threshold !== null && (!Number.isInteger(threshold) || threshold < 0)) errors.lowStockThreshold = 'Use a whole number, 0 or more.';

  return {
    errors,
    data: { name, sku, description: String(body.description ?? '').trim() || null, quantity, cost, sell, threshold },
  };
}

export const getAllProducts = async (req, res) => {
     try {
        
    const search = String(req.query.search || '').trim();
    const params = [req.user.organizationId];
    let where = 'WHERE p.organization_id = ?';
    if (search) {
      where += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(`${SELECT} ${where} ORDER BY p.name ASC`, params);
    res.json({ products: rows.map(shape) });
  } catch (err) { 
    console.log('Get products error:', err);
    return res.status(500).json({
     success: false,
        error: 'Something went wrong. Please try again.',
   })
  }
}

export const getProductById = async (req, res) => {
     try {
    const [rows] = await pool.query(`${SELECT} WHERE p.id = ? AND p.organization_id = ?`, 
        [req.params.id, req.user.organizationId]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: shape(rows[0]) });
  } catch (err) {
    console.log('Get product by ID error:', err);
    return res.status(500).json({
     success: false,
        error: 'Something went wrong. Please try again.',
   })
  } 
    }

 export const  createProduct = async (req, res) => {
    try {
    const { errors, data } = parseBody(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Check the highlighted fields.', fields: errors });

    const [result] = await pool.query(
      `INSERT INTO products (organization_id, name, sku, description, quantity_on_hand, cost_price, selling_price, low_stock_threshold, last_updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.organizationId, data.name, data.sku, data.description, data.quantity, data.cost, data.sell, data.threshold, req.user.id]
    );
    const [rows] = await pool.query(`${SELECT} WHERE p.id = ? AND p.organization_id = ?`, [result.insertId, req.user.organizationId]);
    res.status(201).json({ product: shape(rows[0]) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That SKU is already in use.', fields: { sku: 'SKU must be unique.' } });
    console.log('Create product error:', err);
    return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again.',
    })
  }
 }

 export const changeProduct = async (req, res) => {
    try {
    const { errors, data } = parseBody(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Check the highlighted fields.', fields: errors });

    const [result] = await pool.query(
      `UPDATE products SET name = ?, sku = ?, description = ?, quantity_on_hand = ?, cost_price = ?,
              selling_price = ?, low_stock_threshold = ?, last_updated_by = ?
       WHERE id = ? AND organization_id = ?`,
      [data.name, data.sku, data.description, data.quantity, data.cost, data.sell, data.threshold, req.user.id, req.params.id, req.user.organizationId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Product not found.' });
    const [rows] = await pool.query(`${SELECT} WHERE p.id = ? AND p.organization_id = ?`, [req.params.id, req.user.organizationId]);
    res.json({ product: shape(rows[0]) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That SKU is already in use.', fields: { sku: 'SKU must be unique.' } });
    console.log('Update product error:', err);
    return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again.',
    })
  }
 }


export const updateProduct = async (req, res) => {
  try {
    const delta = Number(req.body.delta);
    if (!Number.isInteger(delta) || delta === 0) {
      return res.status(400).json({ error: 'Enter a whole number other than 0, like 5 or -3.' });
    }

    const [result] = await pool.query(
      `UPDATE products SET quantity_on_hand = quantity_on_hand + ?, last_updated_by = ?
       WHERE id = ? AND organization_id = ? AND quantity_on_hand + ? >= 0`,
      [delta, req.user.id, req.params.id, req.user.organizationId, delta]
    );

    if (!result.affectedRows) {
      const [exists] = await pool.query(
        'SELECT id FROM products WHERE id = ? AND organization_id = ?',
        [req.params.id, req.user.organizationId]
      );
      if (!exists[0]) return res.status(404).json({ error: 'Product not found.' });
      return res.status(400).json({ error: 'Stock can’t go below 0.' });
    }

    const [rows] = await pool.query(
      `${SELECT} WHERE p.id = ? AND p.organization_id = ?`,
      [req.params.id, req.user.organizationId]
    );
    res.json({ product: shape(rows[0]) });
  } catch (err) {
    console.log('Adjust stock error:', err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
    });
  }
};


export const deleteProduct = async (req, res) => {
     try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ? AND organization_id = ?', [req.params.id, req.user.organizationId]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Product not found.' });
    res.status(204).end();
  } catch (err) { 
    console.log('Delete product error:', err);
    return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again.',
    })
  }
   }

