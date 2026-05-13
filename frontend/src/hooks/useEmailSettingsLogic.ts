import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getEmailSettings, updateEmailSettings, type IEmailSettings } from "../api/email-settings";

export const DEFAULT_EMAIL_SETTINGS: IEmailSettings = {
    adminEmailEnabled: true,
    adminEmail: '',
    customerEmailEnabled: true,
    smtpEnabled: false,
    smtpProvider: 'custom',
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpFrom: '',
    smtpUser: '',
    smtpPass: '',
};

export function useEmailSettingsLogic() {
    const queryClient = useQueryClient();
    const [currentSettings, setCurrentSettings] = useState<IEmailSettings>(DEFAULT_EMAIL_SETTINGS);
    const [isDirty, setIsDirty] = useState(false);

    const { data: serverSettings, isLoading, error, refetch } = useQuery<IEmailSettings>({
        queryKey: ["emailSettings"],
        queryFn: getEmailSettings,
    });

    useEffect(() => {
        if (serverSettings) {
            const merged = { ...DEFAULT_EMAIL_SETTINGS, ...serverSettings };
            setCurrentSettings(merged);
            setIsDirty(false);
            
            // App Bridge SaveBar integration
            const saveBar = document.getElementById('settings-save-bar');
            if (saveBar) {
                (saveBar as any).hide();
            }
        }
    }, [serverSettings]);

    const handleFieldChange = useCallback((key: keyof IEmailSettings, value: any) => {
        setCurrentSettings((prev) => {
            const next = { ...prev, [key]: value };
            
            // Provider switching logic
            if (key === 'smtpProvider' && value !== 'custom') {
                import('../api/settings/index').then(({ getSmtpProviders }) => {
                    getSmtpProviders().then(providers => {
                        const provider = providers.find(p => p.value === value);
                        if (provider) {
                            setCurrentSettings(curr => ({
                                ...curr,
                                smtpHost: provider.host,
                                smtpPort: provider.port,
                                smtpSecure: provider.secure
                            }));
                        }
                    });
                });
            }

            return next;
        });

        setIsDirty(true);
        const saveBar = document.getElementById('settings-save-bar');
        if (saveBar) {
            (saveBar as any).show();
        }
    }, []);

    const mutation = useMutation({
        mutationFn: updateEmailSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["emailSettings"] });
            const saveBar = document.getElementById('settings-save-bar');
            if (saveBar) {
                (saveBar as any).hide();
            }
            shopify.toast.show("Email Settings saved successfully");
        },
        onError: (err: any) => {
            shopify.toast.show(`Failed to save: ${err.message}`, { isError: true });
        },
    });

    const handleSave = () => {
        mutation.mutate(currentSettings);
    };

    const handleDiscard = () => {
        if (serverSettings) {
            setCurrentSettings({ ...DEFAULT_EMAIL_SETTINGS, ...serverSettings });
        } else {
            setCurrentSettings(DEFAULT_EMAIL_SETTINGS);
        }
        setIsDirty(false);
        const saveBar = document.getElementById('settings-save-bar');
        if (saveBar) {
            (saveBar as any).hide();
        }
    };

    return {
        currentSettings,
        isLoading,
        error,
        isDirty,
        isSaving: mutation.isPending,
        handleFieldChange,
        handleSave,
        handleDiscard,
        refetch,
    };
}
