import type { QuoteDocument } from "@/types";
import type { ISettings, IPrivateSettings } from "./ISettingsService";

export interface IEmailService {
    sendQuoteNotification(shop: string, quote: QuoteDocument): Promise<void>;
    sendQuoteAcceptance(quote: QuoteDocument, price: number, quantity: number, message: string): Promise<void>;
    sendQuoteRejection(quote: QuoteDocument, message: string): Promise<void>;
    testSmtpConnection(settings: ISettings, privateSettings: IPrivateSettings): Promise<boolean>;
}
