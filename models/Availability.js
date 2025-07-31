import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
    
    professor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    slots: [
        {
            start: Date,
            end: Date
        }
    ]

}, { timestamps: true });

export default mongoose.model('Availability', availabilitySchema)