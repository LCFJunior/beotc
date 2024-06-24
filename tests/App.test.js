const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../UserDetails');
const express = require("express");

jest.mock('../UserDetails');

const app = express();
app.use(express.json());

// Rota para Cadastro
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

// Rota para Alterar
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

// Rota para Excluir
app.delete('/Excluir/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send({ status: 'ok', data: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Rota para Login
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

// Rota de inicialização
app.get("/", (req, res) => {
    res.send({ status: "Started" });
});

// Testes
describe('API Tests', () => {

    // Testes para Cadastro
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

    // Testes para Alterar
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

    // Testes para Excluir
    describe('DELETE /Excluir/:id', () => {
        it('Deve excluir um usuário existente com sucesso', async () => {
            const userId = '1234567890'; // ID de um usuário existente

            User.findByIdAndDelete.mockResolvedValueOnce({ _id: userId });

            const response = await request(app)
                .delete(`/Excluir/${userId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'ok', data: 'User deleted successfully' });
        });

        it('Deve retornar uma mensagem de erro se o usuário não existir', async () => {
            const userId = '1234567890'; // ID de um usuário que não existe

            User.findByIdAndDelete.mockResolvedValueOnce(null);

            const response = await request(app)
                .delete(`/Excluir/${userId}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'User not found' });
        });

        it('Deve retornar uma mensagem de erro se ocorrer um erro interno', async () => {
            const userId = '1234567890'; // ID de um usuário existente

            User.findByIdAndDelete.mockRejectedValueOnce('Internal server error');

            const response = await request(app)
                .delete(`/Excluir/${userId}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Internal server error' });
        });
    });

    // Testes para Login
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

    // Teste para inicialização
    describe('GET /', () => {
        it('Deve retornar status "Started"', async () => {
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: "Started" });
        });
    });
});

module.exports = app; // Exporta a app para ser utilizada em outros lugares, se necessário
