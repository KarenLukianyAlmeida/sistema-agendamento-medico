import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.contoller";

const appointmentsRouter = Router();
const appointmentController = new AppointmentController();

appointmentsRouter.post("/", appointmentController.create);
appointmentsRouter.get("/", appointmentController.listAll);
// Cancelar uma consulta (Usamos PATCH porque estamos a fazer uma alteração parcial do status)
appointmentsRouter.patch("/:id/cancel", appointmentController.cancel);
appointmentsRouter.get("/patient/:patientId", appointmentController.listByPatient);
appointmentsRouter.get("/doctor/:doctorId", appointmentController.listByDoctor);

export default appointmentsRouter;