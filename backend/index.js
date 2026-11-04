import express from "express";
import authRouter from './routes.js/authRoute.js';
import productRouter from './routes.js/productRoute.js';
import settingsRouter from './routes.js/settingsRoute.js';
import dashboardRouter from './routes.js/dashboardRoute.js';
import userRouter from './routes.js/userRoute.js';
import cors from 'cors';


const app = express();

app.use(cors());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello");
});  
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/user', userRouter);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
 
const PORT = process.env.PORT || 8080;


const port = Number(process.env.PORT|| 8080);
app.listen(port, () => console.log(`StockFlow API listening on http://localhost:${port}`));