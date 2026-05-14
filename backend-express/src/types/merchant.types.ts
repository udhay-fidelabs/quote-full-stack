import type { SubscriptionStatus } from "@/constants";
import type { HydratedDocument, Types } from "mongoose";
import type { IPrivateSettings, ISettings } from "../interfaces/services/ISettingsService";

export interface IMerchantUsage {
    quotesUsed: number;
    quotaPeriodStart: Date | null;
}

export interface IMerchant {
    shop: string;
    name?: string;
    scopes?: string;
    email?: string;
    shopOwner?: string;
    currency?: string;
    subscriptionStatus: SubscriptionStatus;
    isActive: boolean;
    planId?: Types.ObjectId;
    usage: IMerchantUsage;
    settings?: ISettings;
    privateSettings?: IPrivateSettings;
    installedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type MerchantDocument = HydratedDocument<IMerchant>;
