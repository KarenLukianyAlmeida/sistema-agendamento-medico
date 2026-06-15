import { Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";

const doctorService = new DoctorService();

export class DoctorController {

    // POST /doctors
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { licenseId, userId, specialityId } = req.body;

            // Validação básica de campos
            if (!licenseId || !userId || !specialityId) {
                res.status(400).json({ error: "Todos os campos são obrigatórios." });
                return; // <-- OBRIGATÓRIO: Garante que para aqui e não lê mais nada!
            }

            const newDoctor = await doctorService.create(licenseId, userId, specialityId);

            res.status(201).json({
                message: "Perfil de médico criado com sucesso.",
                doctor: newDoctor
            });
            return; // <-- OBRIGATÓRIO: Respondeu com sucesso, sai da função!
        } catch (error: any) {
            console.error("Erro ao criar perfil de médico:", error);
            
            if (error.message === "Este utilizador já possui um perfil de médico associado." ||
                error.message === "O utilizador indicado não existe ou não tem a role DOCTOR."
            ) {
                res.status(400).json({ error: error.message });
                return; // <-- OBRIGATÓRIO
            }

            res.status(500).json({ error: "Erro inesperado ao criar perfil de médico." });
            return; // <-- OBRIGATÓRIO
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
            return;
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