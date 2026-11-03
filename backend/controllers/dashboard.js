import {pool} from '../db.js';

export const getDashboard= async(req,res)=>{
    try{ 
        const orgId = req.user.organizationId;
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS totalProducts, COALESCE(SUM(quantity_on_hand), 0) AS totalUnits
       FROM products WHERE organization_id = ?`, [orgId]);

    const [lowStock] = await pool.query(
      `SELECT p.id, p.name, p.sku,
              p.quantity_on_hand AS quantityOnHand,
              COALESCE(p.low_stock_threshold, o.default_low_stock_threshold) AS lowStockThreshold
       FROM products p JOIN organizations o ON o.id = p.organization_id
       WHERE p.organization_id = ?
         AND p.quantity_on_hand <= COALESCE(p.low_stock_threshold, o.default_low_stock_threshold)
       ORDER BY p.quantity_on_hand ASC, p.name ASC`, [orgId]);

    res.json({
      totalProducts: Number(totals.totalProducts),
      totalUnits: Number(totals.totalUnits),
      lowStock,
    });

    }
    catch(err){
        console.log('Dashboard error:', err);
        return res.status(500).json({ 
            success: false,
            error: 'Something went wrong. Please try again.' });
    }
}