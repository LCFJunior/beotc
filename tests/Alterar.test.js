const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../UserDetails');
const express = require("express");

jest.mock('../UserDetails');

const app = express();
app.use(express.json());

app.put('/Alterar/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, email, CPF, telephone, password } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            username: username,
            email: email,
            CPF: CPF,
            telephone: telephone,
            password: password,
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.send({ status: 'ok', data: updatedUser });
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
});

describe('PUT /Alterar/:id', () => {
    it('Deve alterar os dados de um usuário existente com sucesso', async () => {
        const userId = '1234567890'; // ID de um usuário existente
        const updatedUserData = {
            username: 'newusername',
            email: 'newemail@example.com',
            CPF: '98765432100',
            telephone: '987654321',
            password: 'newpassword123',
        };

        User.findByIdAndUpdate.mockResolvedValueOnce(updatedUserData);

        const response = await request(app)
            .put(`/Alterar/${userId}`)
            .send(updatedUserData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok', data: updatedUserData });
    });

    it('Deve retornar uma mensagem de erro se o usuário não existir', async () => {
        const userId = '1234567890'; // ID de um usuário que não existe

        User.findByIdAndUpdate.mockResolvedValueOnce(null);

        const response = await request(app)
            .put(`/Alterar/${userId}`)
            .send({});

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'User not found' });
    });

    it('Deve retornar uma mensagem de erro se ocorrer um erro interno', async () => {
        const userId = '1234567890'; // ID de um usuário existente

        User.findByIdAndUpdate.mockRejectedValueOnce('Internal server error');

        const response = await request(app)
            .put(`/Alterar/${userId}`)
            .send({});

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
    });
});
