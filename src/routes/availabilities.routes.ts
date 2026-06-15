import { Router } from "express";
import { AvailabilityController } from "../controllers/availability.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const availabilitiesRouter = Router();
const availabilityController = new AvailabilityController();

// Qualquer paciente logado pode ver que horários estão livres na clínica
availabilitiesRouter.get("/free", authMiddleware, (req, res) => availabilityController.listAllAvailable(req, res));
availabilitiesRouter.get("/doctor/:doctorId", authMiddleware, (req, res) => availabilityController.listByDoctor(req, res));

// Apenas o próprio MÉDICO (ou o ADMIN) pode ditar a sua agenda de trabalho
availabilitiesRouter.post("/", authMiddleware, roleMiddleware(["DOCTOR", "ADMIN"]), (req, res) => availabilityController.create(req, res));
availabilitiesRouter.put("/:id", authMiddleware, roleMiddleware(["DOCTOR", "ADMIN"]), (req, res) => availabilityController.update(req, res));
availabilitiesRouter.delete("/:id", authMiddleware, roleMiddleware(["DOCTOR", "ADMIN"]), (req, res) => availabilityController.delete(req, res));

export default availabilitiesRouter;