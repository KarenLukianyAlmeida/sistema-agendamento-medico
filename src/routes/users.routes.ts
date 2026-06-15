import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const usersRouter = Router();
const userController = new UserController();

// Público: Qualquer pessoa pode criar a sua conta (ex: Paciente)
usersRouter.post("/", (req, res) => userController.create(req, res));

// Apenas ADMIN pode listar, atualizar ou eliminar utilizadores de forma geral
usersRouter.get("/", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => userController.listAll(req, res));
usersRouter.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => userController.update(req, res));
usersRouter.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => userController.delete(req, res));

export default usersRouter;