import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "minha_chave_secreta_super_protegida_123"; // Deve ser igual à do teu AuthService

// Estendemos a interface Request do Express para que possamos guardar lá dentro os dados do utilizador logado
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

// Middleware para verificar se o utilizador está autenticado (tem Token válido)
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: "Token de autenticação não fornecido." });
        return;
    }

    // O formato do header costuma ser: "Bearer STRING_DO_TOKEN"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({ error: "Formato do token inválido. Use 'Bearer <token>'." });
        return;
    }

    const token = parts[1];

    try {
        // Descodifica o token e extrai o ID e a Role do utilizador
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        
        // Guarda estes dados no objeto da requisição para que os controladores seguintes saibam quem fez o pedido
        req.user = { id: decoded.id, role: decoded.role };

        return next(); // Passa o controlo para a rota/controlador seguinte
    } catch (error) {
        res.status(401).json({ error: "Token inválido ou expirado." });
        return;
    }
}

// Middleware para validar permissões por Cargo (RBAC)
export function roleMiddleware(allowedRoles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        // Garantimos primeiro que o utilizador passou pelo authMiddleware
        if (!req.user) {
            res.status(401).json({ error: "Utilizador não autenticado." });
            return;
        }

        // Verifica se a role do utilizador está na lista de roles permitidas
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: "Acesso negado. Não tens permissões suficientes para esta ação." });
            return;
        }

        return next();
    };
}