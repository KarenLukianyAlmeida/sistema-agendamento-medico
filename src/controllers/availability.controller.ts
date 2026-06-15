import { Request, Response } from "express";
import { AvailabilityService } from "../services/availability.service";

const availabilityService = new AvailabilityService();

export class AvailabilityController {

    // POST /availabilities
    async create(req: Request, res: Response): Promise<void> {
    try {
        const userLogado = (req as any).user; // Pegamos o utilizador real do Token
        const { dateTime } = req.body;

        // Se for um DOCTOR, ele só pode criar disponibilidades para SI PRÓPRIO.
        // Precisamos de passar o userLogado.id para o service conseguir validar ou buscar o Doctor correspondente.
        const newSlot = await availabilityService.createWithAuth(userLogado.id, userLogado.role, req.body.doctorId, dateTime);
        
        res.status(201).json({ slot: newSlot });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

    // GET /availabilities/free
    async listAllAvailable(req: Request, res: Response): Promise<void> {
        try {
            const slots = await availabilityService.listAllAvailable();
            res.status(200).json({ slots });
        } catch (error: any) {
            console.error("Erro ao listar disponibilidades:", error);
            res.status(500).json({ error: "Erro inesperado ao obter horários livres." });
        }
    }

    // GET /availabilities/doctor/:doctorId
    async listByDoctor(req: Request, res: Response): Promise<void> {
        try {
            const { doctorId } = req.params;
            const slots = await availabilityService.listByDoctor(doctorId);
            res.status(200).json({ slots });
        } catch (error: any) {
            console.error("Erro ao listar slots do médico:", error);
            res.status(500).json({ error: "Erro inesperado ao listar horários do médico." });
        }
    }

    // PUT /availabilities/:id
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { dateTime } = req.body; // Postman envia "dateTime"

            const updatedSlot = await availabilityService.update(id, dateTime);
            res.status(200).json({
                message: "Horário de disponibilidade atualizado com sucesso.",
                slot: updatedSlot
            });
        } catch (error: any) {
            console.error("Erro ao atualizar slot:", error);

            if (
                error.message === "ID do slot e a nova data/hora são obrigatórios." ||
                error.message === "Não é possível alterar um horário que já possui um agendamento marcado." ||
                error.message === "Este médico já tem uma disponibilidade registada para este mesmo horário."
            ) {
                res.status(400).json({ error: error.message });
                return;
            }

            if (error.message === "Slot de disponibilidade não encontrado.") {
                res.status(404).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: "Erro inesperado ao atualizar o slot." });
        }
    }

    // DELETE /availabilities/:id
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await availabilityService.delete(id);
            res.status(200).json({ message: "Horário de disponibilidade eliminado com sucesso." });
        } catch (error: any) {
            console.error("Erro ao eliminar slot:", error);

            if (error.message === "Não é possível eliminar um horário que já possui uma consulta marcada.") {
                res.status(400).json({ error: error.message });
                return;
            }

            if (error.message === "Slot de disponibilidade não encontrado.") {
                res.status(404).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: "Erro inesperado ao eliminar o slot." });
        }
    }
}