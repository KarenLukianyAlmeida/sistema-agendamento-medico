import { Request, Response } from "express";
import { SpecialityService } from "../services/speciality.service";
import { Speciality } from '../generated/prisma/index';

const spesialityService = new SpecialityService();

export class SpecialityController {
    // POST
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body; 

            if (!name || name.trim() === "") {
                res.status(400).json({ error: "O nome da especialidade é obrigatório" });
                return;
            }

            const newSpeciality = await spesialityService.create(name);
            res.status(201).json({ message: `Especialidade adicionada com sucesso: ${newSpeciality.name }` });
        } catch (error: any) {
            res.status(400).json({ 
                error: error instanceof Error ? error.message : "Erro inesperado ao registar a especialidade." 
            });
        }
    }

    //GET
    async listAll(req: Request, res: Response): Promise<void> {
        try {
            const specialities = await spesialityService.listAll();
            const specialitiesFormated = specialities.map(speciality => ({
                name: speciality.name,
                id: speciality.id
            }));

            res.status(200).json({ specialities:  specialitiesFormated });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    //UPDATE
    async updateSpeciality(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body;
            const { id } = req.params;

            await spesialityService.update(id, name);

            res.status(200).json({ message: `Nome de especialidade atualizado para ${name}` });
        } catch (error: any) {
            if (error == "Especialidade não encontrada.") {
                res.status(404).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: error.message });
        }
    }

    //DELETE
    async deleteSpeciality(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deletedSpeciality = await spesialityService.delete(id);

            res.status(200).json({ message: `Especialidade ${deletedSpeciality.name} excluida com sucesso.`});
        } catch (error: any) {
            if (error == "Especialidade não encontrada.") {
                res.status(404).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: error.message });
        }
    }
}
