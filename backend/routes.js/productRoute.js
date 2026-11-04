import {Router} from 'express';
import{getAllProducts, getProductById, createProduct,changeProduct, updateProduct, deleteProduct} from '../controllers/productController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const productRouter = Router();

productRouter.get('/', authMiddleware, getAllProducts);
productRouter.post('/:id/adjust', authMiddleware, updateProduct);
productRouter.get('/:id', authMiddleware, getProductById);
productRouter.post('/', authMiddleware, createProduct);
productRouter.patch('/:id', authMiddleware, updateProduct);
productRouter.put('/:id', authMiddleware, changeProduct);
productRouter.delete('/:id', authMiddleware, deleteProduct);
 
export default productRouter;