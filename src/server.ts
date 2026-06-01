import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'API de Agendamento Médico funcionando :)'});
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});