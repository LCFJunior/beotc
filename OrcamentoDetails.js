// models/Orcamento.js
const mongoose = require('mongoose');

const OrcamentoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true },
    celular: { type: String, required: true },
    descricao: { type: String, required: true },
    arquivo: { type: String },
    cep: { type: String, required: true }
});

module.exports = mongoose.model('orcamentos', OrcamentoSchema);
