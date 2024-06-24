require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const Mongo_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5001;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose
    .connect(Mongo_URL)
    .then(() => {
        console.log("Database Connect!");
    })
    .catch((e) => {
        console.log(e);
    });

require('./UserDetails');
require('./OrcamentoDetails');
require('./ContactDetails'); // Importa o modelo de contato

const User = mongoose.model("UserInfo");
const Orcamento = mongoose.model("orcamentos");
const Contato = mongoose.model("Contato");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get("/", (req, res) => {
    res.send({ status: "Started" });
});

app.post('/Cadastro', async (req, res) => {
    const { username, email, CPF, telephone, password } = req.body;

    const ExistentUser = await User.findOne({ email: email });

    if (ExistentUser) {
        return res.send({ data: "User already exists!!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username: username,
            email: email,
            CPF: CPF,
            telephone: telephone,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.send({ status: "ok", data: "User Created", token: token });
    } catch (error) {
        res.send({ status: "error", data: error });
    }
});

app.post("/Login", async (req, res) => {
    const { email, password } = req.body;
    const oldUser = await User.findOne({ email: email });

    if (!oldUser) {
        return res.send({ data: "Usuário não existe" });
    }

    if (await bcrypt.compare(password, oldUser.password)) {
        const token = jwt.sign(
            { userId: oldUser._id, email: oldUser.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.send({
            status: "ok",
            data: token,
            userType: oldUser.userType,
        });
    } else {
        return res.send({ error: "error" });
    }
});

app.delete("/Excluir", authenticateToken, async (req, res) => {
    try {
        console.log("Recebeu solicitação DELETE /Excluir");
        const userId = req.user.userId;
        console.log("ID do usuário a ser excluído:", userId);
        console.log("Usuário excluído com sucesso");
        res.send({ status: "ok", data: "Conta excluída com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        res.status(500).send({ status: "error", data: error });
    }
});

app.put("/Alterar", authenticateToken, async (req, res) => {
    const { username, email, CPF, telephone } = req.body;

    try {
        const userId = req.user.userId;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email, CPF, telephone },
            { new: true }
        );
        res.status(200).send({ status: "ok", data: "Dados atualizados com sucesso", user: updatedUser });
    } catch (error) {
        res.send({ status: "error", data: error });
    }
});

app.post('/Orcamento', upload.single('arquivo'), async (req, res) => {
    const { nome, email, celular, descricao, cep } = req.body;
    const arquivo = req.file ? req.file.filename : null;

    try {
        const novoOrcamento = new Orcamento({
            nome,
            email,
            celular,
            descricao,
            arquivo,
            cep
        });

        await novoOrcamento.save();
        res.status(200).send({ status: "ok", data: "Orçamento enviado com sucesso" });
    } catch (error) {
        res.status(500).send({ status: "error", data: error.message });
    }
});

app.post('/Contato', async (req, res) => {
    const { nome, celular, email, assunto, mensagem } = req.body;

    try {
        const newContact = new Contato({ nome, celular, email, assunto, mensagem });
        await newContact.save();
        res.status(201).send('Contato enviado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao enviar o contato');
    }
});

app.listen(PORT, () => {
    console.log(`Node Js server started on port ${PORT}!`);
});

module.exports = app;