import { injectable } from "inversify";
import { EmailConfig } from "@/models/email-config.model";
import type { IEmailConfigService, IEmailConfigData } from "@/interfaces";
import type { Session } from "@shopify/shopify-api";

@injectable()
export class EmailConfigService implements IEmailConfigService {
    async getConfig(session: Session): Promise<IEmailConfigData> {
        const config = await EmailConfig.findOne({ shop: session.shop });
        if (!config) {
            return {};
        }
        
        const data = config.toObject();
        // Mask the password for security
        if (data.smtpPass) {
            data.smtpPass = "********";
        }
        return data;
    }

    async updateConfig(session: Session, config: IEmailConfigData): Promise<void> {
        // Prevent saving the masked password
        if (config.smtpPass === "********") {
            delete config.smtpPass;
        }

        await EmailConfig.findOneAndUpdate(
            { shop: session.shop },
            { $set: config },
            { upsert: true, new: true }
        );
    }
}
