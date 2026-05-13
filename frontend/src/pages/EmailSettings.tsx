import {
    BlockStack,
    Box,
    Card,
    Layout,
    Page,
    Text,
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";

import { PageLoader } from "../components/loaders/PageLoader";
import { ErrorState } from "../components/common/ErrorState";
import { useEmailSettingsLogic } from "../hooks/useEmailSettingsLogic";
import { NotificationSettings } from "../components/settings/NotificationSettings";

export default function EmailSettings() {
    const {
        currentSettings,
        handleFieldChange,
        handleSave,
        handleDiscard,
        isLoading,

        error,
        refetch,
        isSaving,
    } = useEmailSettingsLogic();

    if (isLoading) return <PageLoader title="Email & SMTP Settings" />;
    
    if (error) {
        return (
            <ErrorState
                title="Email & SMTP Settings"
                message={(error as Error)?.message || "Something went wrong while fetching your email settings."}
                onRetry={() => refetch()}
            />
        );
    }

    return (
        <Page 
            title="Email & SMTP Settings" 
            subtitle="Configure how you and your customers receive quote-related emails."
            backAction={{ content: 'Settings', url: '/settings' }}
        >
            <SaveBar id="settings-save-bar">
                <button variant="primary" onClick={handleSave} disabled={isSaving}>
                    Save
                </button>
                <button onClick={handleDiscard} disabled={isSaving}>
                    Discard
                </button>
            </SaveBar>

            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        <Box padding="400">
                             <NotificationSettings 
                                settings={currentSettings} 
                                onChange={handleFieldChange} 
                            />
                        </Box>
                    </BlockStack>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h2">Need Help?</Text>
                            <Text as="p">
                                Configuring SMTP ensures that emails are sent from your own domain, improving deliverability and customer trust.
                            </Text>
                            <Text as="p">
                                If you use Gmail, make sure to use an "App Password" if 2FA is enabled on your account.
                            </Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
