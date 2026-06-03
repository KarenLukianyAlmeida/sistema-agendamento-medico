import { Router } from "express";
import { SpecialityController } from '../controllers/speciality.controller';

const specialtiesRouter = Router();
const specialityController = new SpecialityController();

//Listar especialidades
specialtiesRouter.get('/', specialityController.listAll);
specialtiesRouter.post('/', specialityController.create);

export default specialtiesRouter;