import { Router } from "express";
import { DoctorController } from "../controllers/doctor.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const doctorsRouter = Router();
const doctorController = new DoctorController();

// Qualquer utilizador autenticado pode listar os médicos e filtrar por especialidade
doctorsRouter.get("/", authMiddleware, (req, res) => doctorController.listAll(req, res));
doctorsRouter.get("/:specialityId", authMiddleware, (req, res) => doctorController.listBySpeciality(req, res));

// Apenas ADMIN pode transformar um User existente num perfil de Doctor oficial (vincular Cédula)
doctorsRouter.post('/', authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => doctorController.create(req, res));
doctorsRouter.put('/:id', authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => doctorController.update(req, res));
doctorsRouter.delete('/:id', authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => doctorController.delete(req, res));

export default doctorsRouter;