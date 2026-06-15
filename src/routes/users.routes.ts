import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const usersRouter = Router();
const userController = new UserController();

// É aqui que o Admin cria os perfis de DOCTOR ou novos ADMINS.
usersRouter.post("/", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => userController.createByAdmin(req, res));

// Apenas ADMIN pode listar, atualizar ou eliminar utilizadores de forma geral
usersRouter.get("/", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => userController.listAll(req, res));
usersRouter.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => userController.update(req, res));
usersRouter.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => userController.delete(req, res));

export default usersRouter;