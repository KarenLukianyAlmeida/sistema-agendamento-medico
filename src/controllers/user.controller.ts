import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
    // POST /users (Privado - Apenas o Admin cria Médicos ou outros Admins)
    async createByAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password, role } = req.body;
            
            // Aqui o Admin manda e o sistema obedece ao 'role' que ele escolheu no Body
            const newUser = await userService.create(name, email, password, role);

            res.status(201).json({
                message: "Utilizador criado pelo administrador com sucesso.",
                user: newUser
            });
        } catch (error: any) {
            console.error("Erro na criação por admin:", error);
            if (error.message === "Este email já se encontra registado." ||
                error.message === "Nome, email e palavra-passe são obrigatórios."
            ) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Erro inesperado ao criar o utilizador." });
        }
    }

    async listAll(req: Request, res: Response): Promise<void> {
        try {
            const users = await userService.listAll();
            res.status(200).json({ users });
        } catch (error: any) {
            res.status(500).json({ error: "Erro inesperado ao listar utilizadores." });
        }
    }

    // PUT /users/:id - Atualizar Utilizador
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, email } = req.body;

            const updatedUser = await userService.update(id, name, email);

            res.status(200).json({
                message: "Utilizador atualizado com sucesso.",
                user: updatedUser
            });
        } catch (error: any) {
            console.error("Erro ao atualizar utilizador:", error);

            if (error.message === "Utilizador não encontrado." ||
                error.message === "Este email já está a ser utilizado por outro utilizador."
            ) {
                res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: "Erro inesperado ao atualizar o utilizador." });
        }
    }

    // DELETE /users/:id - Eliminar Utilizador
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            await userService.delete(id);

            res.status(200).json({
                message: "Utilizador eliminado com sucesso."
            });
        } catch (error: any) {
            console.error("Erro ao eliminar utilizador:", error);

            if (error.message === "Utilizador não encontrado.") {
                res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: "Erro inesperado ao eliminar o utilizador." });
        }
    }
}