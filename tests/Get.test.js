const request = require('supertest');
const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send({ status: "Started" });
});

describe('GET /', () => {
    it('Deve retornar status "Started"', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "Started" });
    });
});