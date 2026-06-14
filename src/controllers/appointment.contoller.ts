import { Request, Response } from "express";
import { AppointmentService } from "../services/appointments.service";

const appointmentService = new AppointmentService();

export class AppointmentController {

    // POST /appointments
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { patientId, slotId } = req.body;

            const newAppointment = await appointmentService.create(patientId, slotId);

            res.status(201).json({
                message: "Consulta agendada com sucesso.",
                appointment: newAppointment
            });
        } catch (error: any) {
            if (
                error.message === "ID do paciente e ID do slot são obrigatórios." ||
                error.message === "Este horário já se encontra reservado por outro paciente."
            ) {
                res.status(400).json({ error: error.message });
            }

            if (
                error.message === "O paciente indicado não existe." ||
                error.message === "O horário selecionado não existe."
            ) {
                res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: "Erro inesperado ao agendar a consulta." });
        }
    }

    // GET /appointments
    async listAll(req: Request, res: Response): Promise<void> {
        try {
            const appointments = await appointmentService.listAll();
            res.status(200).json({ appointments });
        } catch (error: any) {
            res.status(500).json({ error: "Erro inesperado ao obter as consultas." });
        }
    }

    // PATCH /appointments/:id/cancel
    async cancel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const cancelledAppointment = await appointmentService.cancel(id, reason);

            res.status(200).json({
                message: "Consulta cancelada com sucesso. O horário foi libertado.",
                appointment: cancelledAppointment
            });
        } catch (error: any) {
            if (
                error.message === "O ID do agendamento é obrigatório." ||
                error.message === "Esta consulta já se encontra cancelada."
            ) {
                res.status(400).json({ error: error.message });
                return;
            }

            if (error.message === "Agendamento não encontrado.") {
                res.status(404).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: "Erro inesperado ao cancelar a consulta." });
        }
    }

    // GET /appointments/patient/:patientId
    async listByPatient(req: Request, res: Response): Promise<void> {
        try {
            const { patientId } = req.params;
            const appointments = await appointmentService.listByPatient(patientId);
            res.status(200).json({ appointments });
        } catch (error: any) {
            res.status(500).json({ error: "Erro inesperado ao obter consultas do paciente." });
        }
    }

    // GET /appointments/doctor/:doctorId
    async listByDoctor(req: Request, res: Response): Promise<void> {
        try {
            const { doctorId } = req.params;
            const appointments = await appointmentService.listByDoctor(doctorId);
            res.status(200).json({ appointments });
        } catch (error: any) {
            res.status(500).json({ error: "Erro inesperado ao obter consultas do médico." });
        }
    }
}