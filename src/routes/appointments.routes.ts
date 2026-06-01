import { Router } from "express";

const appointmentsRouter = Router();

//Lista consultas (filtros por médico, paciente, data)
appointmentsRouter.get('/', (req, res) => {
    res.json({message: 'Listagem das consultas'});
});

//Agenda uma consulta num slot disponível
appointmentsRouter.post('/', (req, res) => {
    res.status(201).json({message: 'Consulta agendada com sucesso'});
})

//Cancela consulta (com política de cancelamento)
appointmentsRouter.patch('/:id/cancel', (req, res) => {
    res.status(200).json({message: 'Consulta cancelada com sucesso'});
});

export default appointmentsRouter;