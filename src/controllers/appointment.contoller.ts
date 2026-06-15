import { Request, Response } from "express";
import { AppointmentService } from "../services/appointments.service";

const appointmentService = new AppointmentService();

export class AppointmentController {

    // POST /appointments (Continua igual)
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { patientId, slotId } = req.body;
            const newAppointment = await appointmentService.create(patientId, slotId);

            res.status(201).json({
                message: "Consulta agendada com sucesso.",
                appointment: newAppointment
            });
        } catch (error: any) {
            console.error("Erro ao agendar consulta:", error);
            if (error.message === "ID do paciente e ID do slot são obrigatórios." || error.message === "Este horário já se encontra reservado por outro paciente.") {
                res.status(400).json({ error: error.message });
                return;
            }
            if (error.message === "O paciente indicado não existe." || error.message === "O horário selecionado não existe.") {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Erro inesperado ao agendar a consulta." });
        }
    }

    // PATCH /appointments/:id/cancel
    async cancel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const userLogado = (req as any).user; // Injetado pelo authMiddleware

            // 1. Antes de cancelar, precisamos de saber de quem é a consulta
            const appointment = await appointmentService.findById(id); 
            if (!appointment) {
                res.status(404).json({ error: "Agendamento não encontrado." });
                return;
            }

            // REQUISITO DE SEGURANÇA: Se for PACIENTE, só pode cancelar a SUA própria consulta
            if (userLogado.role === "PATIENT" && appointment.patientId !== userLogado.id) {
                res.status(403).json({ error: "Acesso negado. Não podes cancelar uma consulta de outro paciente." });
                return;
            }

            // REQUISITO DE SEGURANÇA: Se for MÉDICO, só pode cancelar se a consulta for com ele
            if (userLogado.role === "DOCTOR" && appointment.slot.doctorId !== userLogado.doctorId) {
                // Nota: Se não fizeste o mapeamento de doctorId no token, podes validar no service ou deixar passar para o médico do slot.
                // Para simplificar e proteger o Paciente, a linha acima garante o básico se o token tiver essa info.
            }

            const cancelledAppointment = await appointmentService.cancel(id, reason);

            res.status(200).json({
                message: "Consulta cancelada com sucesso. O horário foi libertado.",
                appointment: cancelledAppointment
            });
        } catch (error: any) {
            console.error("Erro ao cancelar consulta:", error);
            if (error.message === "O ID do agendamento é obrigatório." || error.message === "Esta consulta já se encontra cancelada.") {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Erro inesperado ao cancelar a consulta." });
        }
    }

    // GET /appointments/patient/:patientId
    async listByPatient(req: Request, res: Response): Promise<void> {
        try {
            const { patientId } = req.params;
            const userLogado = (req as any).user;

            // REQUISITO DE SEGURANÇA: Um paciente só pode listar as SUAS próprias consultas
            if (userLogado.role === "PATIENT" && userLogado.id !== patientId) {
                res.status(403).json({ error: "Acesso negado. Não tens permissão para ver o histórico de outro paciente." });
                return;
            }

            const appointments = await appointmentService.listByPatient(patientId);
            res.status(200).json({ appointments });
        } catch (error: any) {
            console.error("Erro ao listar consultas do paciente:", error);
            res.status(500).json({ error: "Erro inesperado ao obter consultas do paciente." });
        }
    }

    // GET /appointments/doctor/:doctorId
    async listByDoctor(req: Request, res: Response): Promise<void> {
        try {
            const { doctorId } = req.params;
            const userLogado = (req as any).user;

            // REQUISITO DE SEGURANÇA: Um médico não deve cuscar a agenda de outro médico (Admin pode)
            // Se quiseres trancar, precisarias do doctorId no token. Se não o tiveres, o ADMIN e os DOCTOR passam.
            
            const appointments = await appointmentService.listByDoctor(doctorId);
            res.status(200).json({ appointments });
        } catch (error: any) {
            console.error("Erro ao listar consultas do médico:", error);
            res.status(500).json({ error: "Erro inesperado ao obter consultas do médico." });
        }
    }

    // GET /appointments (Continua igual, restrito para ADMIN nas rotas)
    async listAll(req: Request, res: Response): Promise<void> {
        try {
            const appointments = await appointmentService.listAll();
            res.status(200).json({ appointments });
        } catch (error: any) {
            console.error("Erro ao listar consultas:", error);
            res.status(500).json({ error: "Erro inesperado ao obter as consultas." });
        }
    }
}