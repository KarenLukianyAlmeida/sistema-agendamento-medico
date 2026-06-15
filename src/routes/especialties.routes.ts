import { Router } from "express";
import { SpecialityController } from '../controllers/speciality.controller';
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const specialtiesRouter = Router();
const specialityController = new SpecialityController();

// Qualquer pessoa logada pode listar especialidades para escolher o seu médico
specialtiesRouter.get('/', authMiddleware, (req, res) => specialityController.listAll(req, res));

// Apenas ADMIN pode gerir o catálogo de especialidades do hospital
specialtiesRouter.post('/', authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => specialityController.create(req, res));
specialtiesRouter.put('/:id', authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => specialityController.updateSpeciality(req, res));
specialtiesRouter.delete('/:id', authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => specialityController.deleteSpeciality(req, res));

export default specialtiesRouter;