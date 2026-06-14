import express from "express";

import specialtiesRouter from "./routes/especialties.routes";
import usersRouter from "./routes/users.routes";
import doctorsRouter from "./routes/doctors.routes";
import appointmentsRouter from "./routes/appointments.routes";
import availabilitiesRouter from "./routes/availabilities.routes";

const app = express();
const PORT = 3000;

app.use(express.json());

//Rota de teste - home...
app.get('/', (req, res) => {
    res.json({message: 'API de Agendamento Médico funcionando!'});
});

//Vinculação das rotas
app.use('/specialities', specialtiesRouter);~
app.use('/users', usersRouter);
app.use('/doctors', doctorsRouter);
app.use('/availabilities', availabilitiesRouter)
app.use('/appointments', appointmentsRouter);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});