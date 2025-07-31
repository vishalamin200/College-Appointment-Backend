import dotenv from 'dotenv';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';

describe('E2E Appointment Flow (JWT Auth)', () => {
    let agentP, agentA1, agentA2;
    let professorId;

    beforeAll(async () => {

        dotenv.config()
        await mongoose.connect(process.env.MONGO_URI);

        agentP = request.agent(app);
        agentA1 = request.agent(app);
        agentA2 = request.agent(app);

    })

    test('Full appointment flow', async () => {

        // student A1 login
        await agentA1
            .post('/api/auth/login')
            .send({ email: 'a1@test.com', password: '12345' });


        //  professor P login
        const profRes = await agentP
            .post('/api/auth/login')
            .send({ email: 'p@test.com', password: '12345' });


        professorId = profRes.body.user._id;


        // Professor P sets availability T
        const slotT = {
            start: "2025-08-05T09:00:00.000Z",
            end: "2025-08-05T12:00:00.000Z"
        };

        await agentP.post('/api/availability').send({ slots: [slotT] });


        // Student A1 views available slots for Professor P
        const view1 = await agentA1.get(`/api/availability/${professorId}`);
        expect(Array.isArray(view1.body.availability.slots)).toBe(true);


        // Student A1 books appointment T1
        const slotT1 = {
            start: "2025-08-05T09:00:00.000Z",
            end: "2025-08-05T10:00:00.000Z"
        };

        const book1 = await agentA1
            .post('/api/appointments')
            .send({ professorId, slot: slotT1 });


        const appointment1 = book1.body.appointment;


        // Student A2 authenticates
        await agentA2
            .post('/api/auth/login')
            .send({ email: 'a2@test.com', password: '12345' });


        // Professor P1 sets availability T2
        const slotT2 = {
            start: "2025-08-05T11:00:00.000Z",
            end: "2025-08-05T12:00:00.000Z"
        };
        await agentP.post('/api/availability').send({ slots: [slotT2] });

        // Student A2 books appointment T2
        await agentA2
            .post('/api/appointments')
            .send({ professorId, slot: slotT2 });


        // Professor P1 cancels Student A1's appointment
        await agentP.delete(`/api/appointments/${appointment1._id}`);


        // Student A1 checks appointments
        const appsA1 = await agentA1.get('/api/appointments');
        expect(appsA1.body.appointments).toEqual([]);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});