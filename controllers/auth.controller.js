import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7 days' });

const cookieOptions = {
    secure: false,               
    sameSite: 'none',           
    httpOnly: true,              
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
};


export const register = async (req, res) => {

    const { name, email, password, role } = req.body;

    const requiredFields = { name, email, password, role };

    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
            return res.status(400).json({ success: false, message: `${key} is required` });
        }
    }

    if (!['student', 'professor'].includes(role)){
        return res.status(400).json({ success:false, message: `role can be student or professor` });
    }

    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({ success: true, message:"Account created successfully", token: generateToken(user._id), user });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

    if(!emailRegex.test(email)){
        return res.status(400).json({ success: false, message: 'Email is not a valid email' });
    }

    const user = await User.findOne({ email }).select("+password");

    if(!user){
        return res.status(400).json({ success: false, message: "No account found with provided email" });
    }

    if (user && await user.matchPassword(password)) {
        const token = await user.generateJwtToken()
        res.cookie("token", token,cookieOptions)
        return res.json({ success: true, message:"Login Successfully",  user });
    }

    res.status(401).json({ success: false, message: 'Invalid credentials' });
};
