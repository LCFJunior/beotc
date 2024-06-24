const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../UserDetails');
const express = require("express");

jest.mock('../UserDetails');

const app = express();
app.use(express.json());

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
