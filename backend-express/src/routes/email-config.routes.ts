import { shopify } from "@/config/shopify.config";
import { PlanAction } from "@/constants/plan.constants";
import type { EmailConfigController } from "@/controllers/email-config.controller";
import { container } from "@/inversify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { TYPES } from "@/types";
import { Router, json } from "express";

const emailConfigRouter = Router();
const controller = container.get<EmailConfigController>(TYPES.EmailConfigController);

emailConfigRouter.use(shopify.validateAuthenticatedSession());
emailConfigRouter.use(json());

emailConfigRouter.get("/", planGuard(PlanAction.SETTINGS_UPDATE), controller.getConfig);
emailConfigRouter.put("/", planGuard(PlanAction.SETTINGS_UPDATE), controller.updateConfig);
emailConfigRouter.get("/smtp-providers", planGuard(PlanAction.SETTINGS_UPDATE), controller.getSmtpProviders);
emailConfigRouter.post("/test-smtp", planGuard(PlanAction.SETTINGS_UPDATE), controller.testSmtp);

export default emailConfigRouter;
