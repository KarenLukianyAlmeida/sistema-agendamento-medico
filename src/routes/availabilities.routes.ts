import { Router } from "express";
import { AvailabilityController } from "../controllers/availability.controller";

const availabilitiesRouter = Router();
const availabilityController = new AvailabilityController();

availabilitiesRouter.post("/", availabilityController.create);
availabilitiesRouter.get("/free", availabilityController.listAllAvailable);
availabilitiesRouter.get("/doctor/:doctorId", (req, res) => availabilityController.listByDoctor(req, res));
availabilitiesRouter.put("/:id", availabilityController.update);
availabilitiesRouter.delete("/:id", availabilityController.delete);

export default availabilitiesRouter;