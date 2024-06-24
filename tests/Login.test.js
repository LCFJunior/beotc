const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../UserDetails');
const express = require("express");

jest.mock('../UserDetails');

const app = express();
app.use(express.json());

app.post('/Login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.send({ data: "Usuário não existe" });
    }

    if (password !== user.password) {
        return res.send({ data: "Senha incorreta" });
    }

    res.send({ status: "ok", data: "Login successful" });
});

describe('POST /Login', () => {
    it('Deve fazer login com sucesso para um usuário existente', async () => {
        const userData = {
            email: 'testuser@example.com',
            password: 'password123',
        };

        User.findOne.mockResolvedValueOnce({
            email: 'testuser@example.com',
            password: 'password123',
        });

        const response = await request(app)
            .post('/Login')
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok", data: "Login successful" });
    });

    it('Deve retornar uma mensagem de erro se o usuário não existir', async () => {
        const userData = {
            email: 'nonexistent@example.com',
            password: 'password123',
        };

        User.findOne.mockResolvedValueOnce(null);

        const response = await request(app)
            .post('/Login')
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: "Usuário não existe" });
    });

    it('Deve retornar uma mensagem de erro se a senha estiver incorreta', async () => {
        const userData = {
            email: 'testuser@example.com',
            password: 'wrongpassword',
        };

        User.findOne.mockResolvedValueOnce({
            email: 'testuser@example.com',
            password: 'password123',
        });

        const response = await request(app)
            .post('/Login')
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: "Senha incorreta" });
    });
});
