import { Router } from "express";

const especialtiesRouter = Router();

//Listar especialidades
especialtiesRouter.get('/', (req, res) => {
    res.json({message: 'Listagem de especialidades médica'});
});

export default especialtiesRouter;