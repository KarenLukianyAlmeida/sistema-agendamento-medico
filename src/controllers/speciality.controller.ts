import { Request, Response } from "express";
import { SpecialityService } from "../services/speciality.service";

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
            res.status(201).json({ newSpeciality });
        } catch (error: any) {
            console.error("Erro interno no controlador:", error); // Ver o erro real no terminal do VS Code
            
            // Garante que o Postman nunca mais fica a carregar infinitamente
            res.status(400).json({ 
                error: error instanceof Error ? error.message : "Erro inesperado ao registar a especialidade." 
            });
        }
    }

    //GET
    async listAll(req: Request, res: Response): Promise<void> {
        try {

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
