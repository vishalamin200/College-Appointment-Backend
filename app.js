import express from 'express';
import authRoutes from './routes/auth.route.js';
import availabilityRoutes from './routes/availability.route.js';
import appointmentRoutes from './routes/appointment.route.js';
import { authMiddleware } from './middlewares/auth.js';
import cookieParser from 'cookie-parser'

const app = express();
app.use(express.json());
app.use(cookieParser())


// for auth
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/availability', authMiddleware, availabilityRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);

// health
app.get('/health',(req,res)=>{
    res.json({
        status:'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    })
})

app.get('/',(req,res)=>{
    res.send("Server is running perfectly")
})

export default app;
