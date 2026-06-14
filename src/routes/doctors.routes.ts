import { Router } from "express";
import { DoctorController } from "../controllers/doctor.controller";

const doctorsRouter = Router();
const doctorController = new DoctorController();

doctorsRouter.post('/', doctorController.create);
doctorsRouter.get("/", doctorController.listAll);
doctorsRouter.get("/:specialityId", doctorController.listBySpeciality);
doctorsRouter.put('/:id', doctorController.update);
doctorsRouter.delete('/:id', doctorController.delete);

export default doctorsRouter;