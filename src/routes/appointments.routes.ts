import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.contoller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const appointmentsRouter = Router();
const appointmentController = new AppointmentController();

// Aplicamos o escudo básico de autenticação a TODAS as rotas de agendamentos
appointmentsRouter.use(authMiddleware);

// Pacientes e Médicos podem interagir com as consultas
appointmentsRouter.post("/", roleMiddleware(["PATIENT", "ADMIN"]), (req, res) => appointmentController.create(req, res));
appointmentsRouter.patch("/:id/cancel", roleMiddleware(["PATIENT", "DOCTOR", "ADMIN"]), (req, res) => appointmentController.cancel(req, res));

// Listagens específicas
appointmentsRouter.get("/patient/:patientId", roleMiddleware(["PATIENT", "ADMIN"]), (req, res) => appointmentController.listByPatient(req, res));
appointmentsRouter.get("/doctor/:doctorId", roleMiddleware(["DOCTOR", "ADMIN"]), (req, res) => appointmentController.listByDoctor(req, res));

// Apenas o painel administrativo deve conseguir extrair o relatório de TODAS as consultas do sistema
appointmentsRouter.get("/", roleMiddleware(["ADMIN"]), (req, res) => appointmentController.listAll(req, res));

export default appointmentsRouter;