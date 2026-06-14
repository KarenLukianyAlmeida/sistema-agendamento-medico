import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            res.status(200).json({
                message: "Autenticação efetuada com sucesso.",
                ...result
            });
        } catch (error: any) {
            if (error.message === "Email e password são obrigatórios." || error.message === "Credenciais inválidas.") {
                res.status(401).json({ error: error.message });
            }

            res.status(500).json({ error: "Erro inesperado ao efetuar login." });
        }
    }
}