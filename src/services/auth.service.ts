import { prisma } from "../prisma";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define uma chave secreta para assinar o token (em produção isto deve ir para o .env)
const JWT_SECRET = "minha_chave_secreta_super_protegida_123";

export class AuthService {
    async login(emailInput: string, passwordInput: string) {
        if (!emailInput || !passwordInput) {
            throw new Error("Email e password são obrigatórios.");
        }

        // 1. Procura o utilizador pelo e-mail
        const user = await prisma.user.findUnique({
            where: { email: emailInput }
        });

        if (!user) {
            throw new Error("Credenciais inválidas."); // Mensagem genérica por segurança
        }

        // 2. Compara a password enviada com o hash guardado na base de dados
        const passwordMatch = await bcrypt.compare(passwordInput, user.password);
        if (!passwordMatch) {
            throw new Error("Credenciais inválidas.");
        }

        // 3. Gera o Token JWT contendo o ID e o Cargo (Role) do utilizador no Payload
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" } // O token expira em 1 dia
        );

        // 4. Retorna os dados públicos do utilizador e o Token
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        };
    }
}