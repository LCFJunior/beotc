const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../UserDetails');
const express = require("express");

jest.mock('../UserDetails');

const app = express();
app.use(express.json());

app.post('/Cadastro', async (req, res) => {
    const { username, email, CPF, telephone, password } = req.body;

    const ExistentUser = await User.findOne({ email: email });

    if (ExistentUser) {
        return res.send({ data: "User already exists!!" });
    }

    try {
        await User.create({
            username: username,
            email: email,
            CPF: CPF,
            telephone: telephone,
            password: password,
        });
        res.send({ status: "ok", data: "User Created" });
    } catch (error) {
        res.send({ status: "error", data: error });
    }
});

describe('POST /Cadastro', () => {
    it('Deve criar um novo usuário com sucesso', async () => {
        const userData = {
            username: 'testuser',
            email: 'testuser@example.com',
            CPF: '12345678900',
            telephone: '123456789',
            password: 'password123',
        };

        User.findOne.mockResolvedValueOnce(null);
        User.create.mockResolvedValueOnce(userData);

        const response = await request(app)
            .post('/Cadastro')
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok", data: "User Created" });
    });

    it('Deve retornar uma mensagem de erro se o usuário já existir', async () => {
        const userData = {
            username: 'testuser',
            email: 'testuser@example.com',
            CPF: '12345678900',
            telephone: '123456789',
            password: 'password123',
        };

        User.findOne.mockResolvedValueOnce(userData);

        const response = await request(app)
            .post('/Cadastro')
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: "User already exists!!" });
    });
});
