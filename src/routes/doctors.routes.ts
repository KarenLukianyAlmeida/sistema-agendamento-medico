import { Router } from "express";

const doctorsRouter = Router();

//Lista todos os médicos
doctorsRouter.get('/', (req, res) => {
    res.json({message: 'Listagem de médicos'});
});

//Lista slots disponíveis (por data/semana)
doctorsRouter.get('/:id/slots', (req, res) => {
    const { id } = req.params;
    res.json({message: `Listagem de slots disponíveis para o médico ${id}`});
})

//Define disponibilidade semanal (médico)
doctorsRouter.post('/:id/availability', (req, res) => {
    const { id } = req.params;
    res.status(201).json({message: `Disponibilidade semanal definida para o médico ${id}`});
});

//Remove slot disponível
doctorsRouter.delete('/:id/availability/:slotId', (req, res) => {
    const { id, slotId } = req.params;
    res.status(200).json({message: 'Slot removido com sucesso'});
});

export default doctorsRouter;