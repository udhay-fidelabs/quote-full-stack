import type { IEmailConfigRepository } from "@/interfaces";
import { EmailConfig, type IEmailConfig } from "@/models/email-config.model";
import { injectable } from "inversify";
import type mongoose from "mongoose";
import { MongooseBaseRepository } from "../base/base.repository";

@injectable()
export class EmailConfigRepository extends MongooseBaseRepository<IEmailConfig> implements IEmailConfigRepository {
    constructor() {
        super(EmailConfig);
    }

    async findByShop(shop: string): Promise<mongoose.HydratedDocument<IEmailConfig> | null> {
        return await this.findOne({ shop });
    }

    async upsertConfig(shop: string, config: Partial<IEmailConfig>): Promise<void> {
        await this.model.findOneAndUpdate({ shop }, { $set: config }, { upsert: true, new: true }).exec();
    }
}
