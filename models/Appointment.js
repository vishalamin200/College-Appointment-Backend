import mongoose from "mongoose";


const appointmentSchema = new mongoose.Schema({
    
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    professor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    slot: {
        start: { 
            type: Date, 
            required: true 
        },
        end: { 
            type: Date, 
            required: true 
        }
    },

    status: { 
        type: String, 
        enum: ['booked', 'canceled'], 
        default: 'booked' 
    }

}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);