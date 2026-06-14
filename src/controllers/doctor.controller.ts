import { Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";

const doctorService = new DoctorService();

export class DoctorController {

    // POST /doctors
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { licenseId, userId, specialityId } = req.body;

            const newDoctor = await doctorService.create(licenseId, userId, specialityId);

            res.status(201).json({
                message: "Perfil de médico criado com sucesso.",
                doctor: newDoctor
            });
        } catch (error: any) {
            if (
                error.message === "Cédula profissional, ID do utilizador e ID da especialidade são obrigatórios." ||
                error.message === "Esta cédula profissional já se encontra registada." ||
                error.message === "O utilizador indicado não existe." ||
                error.message === "Este utilizador já possui um perfil de médico associado." ||
                error.message === "A especialidade indicada não existe."
            ) {
                res.status(400).json({ error: error.message });
            }

            res.status(500).json({ error: "Erro inesperado ao criar o perfil de médico." });
        }
    }

    // GET /doctors - Listar todos
    async listAll(req: Request, res: Response): Promise<void> {
        try {
            const doctors = await doctorService.listAll();
            res.status(200).json({ doctors });
        } catch (error: any) {
            res.status(500).json({ error: "Erro inesperado ao listar os médicos." });
        }
    }

    // GET /doctors/speciality/:specialityId - Filtrar por especialidade
    async listBySpeciality(req: Request, res: Response): Promise<void> {
        try {
            const { specialityId } = req.params;
            
            const doctors = await doctorService.listBySpeciality(specialityId);
            res.status(200).json({ doctors });
        } catch (error: any) {
            if (error.message === "A especialidade indicada não existe.") {
                res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro inesperado ao filtrar médicos." });
        }
    }

    // PUT /doctors/:id - Atualizar Perfil do Médico
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { licenseId, specialityId } = req.body;

            const updatedDoctor = await doctorService.update(id, licenseId, specialityId);

            res.status(200).json({
                message: "Perfil de médico atualizado com sucesso.",
                doctor: updatedDoctor
            });
        } catch (error: any) {
            console.error("Erro ao atualizar médico:", error);

            if (error.message === "Perfil de médico não encontrado.") {
                res.status(404).json({ error: error.message });
            }
            if (
                error.message === "Esta cédula profissional já está a ser utilizada por outro médico." ||
                error.message === "A nova especialidade indicada não existe."
            ) {
                res.status(400).json({ error: error.message });
            }

            res.status(500).json({ error: "Erro inesperado ao atualizar o médico." });
        }
    }

    // DELETE /doctors/:id - Eliminar Perfil do Médico
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            await doctorService.delete(id);

            res.status(200).json({
                message: "Perfil de médico eliminado com sucesso."
            });
        } catch (error: any) {
            console.error("Erro ao eliminar médico:", error)
            if (error.message === "Perfil de médico não encontrado.") {
                res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: "Erro inesperado ao eliminar o médico." });
        }
    }
}