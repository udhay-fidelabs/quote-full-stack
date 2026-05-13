import { API_MESSAGES } from "@/constants/app.constants";
import type { IEmailService, IPlanService, ISettingsService } from "@/interfaces";
import { TYPES } from "@/types";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "./base.controller";

@injectable()
export class SettingsController extends BaseController {
    constructor(
        @inject(TYPES.ISettingsService) private settingsService: ISettingsService,
        @inject(TYPES.IPlanService) private planService: IPlanService,
        @inject(TYPES.IEmailService) private emailService: IEmailService,
    ) {
        super();
    }

    public getSettings = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;

            await this.settingsService.ensureMetafieldDefinitions(session);

            const settings = await this.settingsService.getSettings(session);
            const privateSettings = await this.settingsService.getPrivateSettings(session);
            const plan = await this.planService.getMerchantPlan(session.shop);
            const themeAudit = await this.settingsService.checkAppEmbedStatus(session);

            // Append plan and connectivity information to settings response
            const settingsExtended = {
                ...settings,
                smtpUser: privateSettings.smtpUser || "",
                smtpPass: privateSettings.smtpPass ? "********" : "", // Mask password
                plan: plan?.name,
                isAppEmbedded: themeAudit.isEmbedded,
                deepLinkUrl: themeAudit.themeId
                    ? `https://admin.shopify.com/store/${session.shop.split(".")[0]}/themes/${themeAudit.themeId}/editor?context=apps`
                    : "shopify:admin/themes/current/editor?context=apps",
            };

            return this.ok(res, settingsExtended, API_MESSAGES.SETTINGS.RETRIEVED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_RETRIEVE);
        }
    };

    public updateSettings = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const { smtpUser, smtpPass, ...publicSettings } = req.body;

            // Update public settings
            await this.settingsService.updateSettings(session, publicSettings);

            // Update private settings if provided
            if (smtpUser !== undefined || smtpPass !== undefined) {
                const currentPrivate = await this.settingsService.getPrivateSettings(session);
                const updatedPrivate = {
                    smtpUser: smtpUser !== undefined ? smtpUser : currentPrivate.smtpUser,
                    smtpPass: smtpPass !== undefined && smtpPass !== "********" ? smtpPass : currentPrivate.smtpPass,
                };
                await this.settingsService.updatePrivateSettings(session, updatedPrivate);
            }

            return this.ok(res, { success: true }, API_MESSAGES.SETTINGS.UPDATED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_UPDATE);
        }
    };

    public getPrivateSettings = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const privateSettings = await this.settingsService.getPrivateSettings(session);
            return this.ok(res, {
                smtpUser: privateSettings.smtpUser || "",
                smtpPass: privateSettings.smtpPass ? "********" : "",
            });
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_RETRIEVE);
        }
    };

    public updatePrivateSettings = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            await this.settingsService.updatePrivateSettings(session, req.body);
            return this.ok(res, { success: true }, API_MESSAGES.SETTINGS.UPDATED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_UPDATE);
        }
    };


    public getSmtpProviders = async (req: Request, res: Response) => {
        const { SMTP_PROVIDER_PRESETS } = await import("@/constants/app.constants");
        return this.ok(res, SMTP_PROVIDER_PRESETS, "SMTP providers retrieved");
    };
}
