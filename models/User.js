import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({

    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true,
        select:false
    },
    role: { 
        type: String, 
        enum: ['student', 'professor'], 
        required: true 
    }

}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

userSchema.methods.generateJwtToken = async function(){
    const payload = {
        id: this._id?.toString(),
        name:this.name,
        email:this.email
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d" 
    });

}

export default mongoose.model('User', userSchema);