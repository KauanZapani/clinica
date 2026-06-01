import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import servicesRouter from "./services";
import appointmentsRouter from "./appointments";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clientsRouter);
router.use(servicesRouter);
router.use(appointmentsRouter);
router.use(dashboardRouter);

export default router;
