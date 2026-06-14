import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const usersRouter = Router();
const userController = new UserController();

usersRouter.post("/", (req, res) => userController.create(req, res));
usersRouter.get("/", (req, res) => userController.listAll(req, res));
usersRouter.put("/:id", (req, res) => userController.update(req, res));
usersRouter.delete("/:id", (req, res) => userController.delete(req, res));

export default usersRouter;