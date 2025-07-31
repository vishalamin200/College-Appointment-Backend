import Availability from '../models/Availability.js';

export const setAvailability = async (req, res) => {

    if (req.user.role !== 'professor') {
        return res.status(403).json({ success: false, message: 'Only professors can set availability.' });
    }

    const { slots } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ success: false, message: 'Slots must be a non-empty array.' });
    }

    for (const slot of slots) {

        if (!slot.start || !slot.end) {
            return res.status(400).json({ success: false, message: 'Each slot must have a valid start and end time.' });
        }

        const start = new Date(slot.start);
        const end = new Date(slot.end);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return res.status(400).json({ success: false, message: 'Slot times must be valid and start must be before end.' });
        }
    }

    try {
        
        let avail = await Availability.findOne({ professor: req.user._id });

        if (avail) {
            avail.slots = slots;
            await avail.save();
        } else {
            avail = await Availability.create({ professor: req.user._id, slots });
        }

        res.json({ success: true, message: 'Availability set successfully', availability: avail });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while setting availability.' });
    }
};



export const getAvailability = async (req, res) => {

    const { professorId } = req.params;

    if (!professorId) return res.status(400).json({success:false, message: 'professorId is required!' });


    const avail = await Availability.findOne({ professor: professorId });

    res.json({success:true, message:"Availability fetched successfully", availability: avail});
};