import type { Session } from "@shopify/shopify-api";

export interface IEmailConfigData {
    adminEmailEnabled?: boolean;
    adminEmail?: string;
    customerEmailEnabled?: boolean;
    smtpEnabled?: boolean;
    smtpProvider?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpFrom?: string;
    smtpUser?: string;
    smtpPass?: string;
}

export interface IEmailConfigService {
    getConfig(session: Session): Promise<IEmailConfigData>;
    updateConfig(session: Session, config: IEmailConfigData): Promise<void>;
}
