import { API_MESSAGES } from "@/constants/app.constants";
import type { IEmailConfigService, IEmailService } from "@/interfaces";
import { TYPES } from "@/types";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "./base.controller";
import { EmailConfig } from "@/models/email-config.model";

@injectable()
export class EmailConfigController extends BaseController {
    constructor(
        @inject(TYPES.IEmailConfigService) private emailConfigService: IEmailConfigService,
        @inject(TYPES.IEmailService) private emailService: IEmailService,
    ) {
        super();
    }

    public getConfig = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const config = await this.emailConfigService.getConfig(session);
            return this.ok(res, config, "Email configuration retrieved successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to retrieve email configuration");
        }
    };

    public updateConfig = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            await this.emailConfigService.updateConfig(session, req.body);
            return this.ok(res, { success: true }, "Email configuration updated successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to update email configuration");
        }
    };

    public testSmtp = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const { smtpUser, smtpPass, ...publicSettings } = req.body;

            // If password is masked, fetch the real one
            let realPass = smtpPass;
            if (smtpPass === "********") {
                const config = await EmailConfig.findOne({ shop: session.shop });
                realPass = config?.smtpPass || "";
            }

            const success = await this.emailService.testSmtpConnection(publicSettings, {
                smtpUser,
                smtpPass: realPass,
            });

            if (success) {
                return this.ok(res, { success: true }, "SMTP connection successful. Test email sent.");
            }

            return this.handleError(res, new Error("SMTP verification failed"), "Failed to connect to SMTP server");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "SMTP test failed";
            return this.handleError(res, error, message);
        }
    };
}
