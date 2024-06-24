const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    celular: { type: String, required: true },
    email: { type: String, required: true },
    assunto: { type: String, required: true },
    mensagem: { type: String, required: true }
});

mongoose.model('Contato', contactSchema);