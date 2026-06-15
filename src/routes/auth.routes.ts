import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/login", (req, res) => authController.login(req, res));

// Nova Rota Pública: Registo Autónomo de Pacientes
authRouter.post("/register", (req, res) => authController.register(req, res));

export default authRouter;