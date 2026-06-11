import { Router } from "express";
import { SpecialityController } from '../controllers/speciality.controller';

const specialtiesRouter = Router();
const specialityController = new SpecialityController();

specialtiesRouter.get('/', specialityController.listAll);
specialtiesRouter.post('/', specialityController.create);
specialtiesRouter.put('/:id', specialityController.updateSpeciality);
specialtiesRouter.delete('/:id', specialityController.deleteSpeciality);

export default specialtiesRouter;