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
    smtpFromName?: string;
    smtpUser?: string;
    smtpPass?: string;
}
