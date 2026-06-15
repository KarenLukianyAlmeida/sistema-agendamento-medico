import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service"; // <-- Adicionado

const authService = new AuthService();
const userService = new UserService(); // <-- Adicionado

export class AuthController {
    
    // POST /auth/login (Público)
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

    // POST /auth/register (Público - Movido para aqui!)
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body; 
            
            // Forçamos explicitamente que qualquer registo público nasce como "PATIENT"
            const newUser = await userService.create(name, email, password, "PATIENT" as any);

            res.status(201).json({
                message: "Conta de paciente criada com sucesso.",
                user: newUser
            });
        } catch (error: any) {
            if (error.message === "Este email já se encontra registado." ||
                error.message === "Nome, email e palavra-passe são obrigatórios."
            ) {
                res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro inesperado ao registar o utilizador." });
        }
    }
}