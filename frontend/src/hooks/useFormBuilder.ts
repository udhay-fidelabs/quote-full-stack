import { useState, useEffect } from 'react';
import { getForm, updateForm, type IForm } from '../api/forms';
import { usePlanUsage } from '../hooks/usePlanUsage';

export function useFormBuilder() {
    const [formState, setFormState] = useState<IForm | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);

    const { hasPermission, isLoading: isPlanLoading } = usePlanUsage();
    const [canEdit, setCanEdit] = useState(true);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const data = await getForm();

                // Ensure we have exactly 3 steps for the new segmented builder experience
                const requiredSteps = [
                    { id: 'contact-info', title: 'Contact Information', fields: [] as any[] },
                    { id: 'address-info', title: 'Shipping Address', fields: [] as any[] },
                    { id: 'details-info', title: 'Additional Details', fields: [] as any[] }
                ];

                if (data.steps && data.steps.length > 0) {
                    const allFields = data.steps.flatMap(step => step.fields);
                    
                    // Re-distribute existing fields into the 3 new buckets based on labels
                    requiredSteps[0].fields = allFields.filter(f => {
                        if (f.type === 'section') return false;
                        const l = (f.label || '').toLowerCase();
                        return l.includes('name') || l.includes('email') || l.includes('phone');
                    });
                    
                    requiredSteps[1].fields = allFields.filter(f => {
                        if (f.type === 'section') return false;
                        const l = (f.label || '').toLowerCase();
                        return l.includes('address') || l.includes('city') || l.includes('country') || l.includes('pincode') || l.includes('state') || l.includes('district');
                    });

                    requiredSteps[2].fields = allFields.filter(f => {
                        if (f.type === 'section') return false;
                        const l = (f.label || '').toLowerCase();
                        return l.includes('message') || l.includes('note') || l.includes('additional') || 
                               (!requiredSteps[0].fields.includes(f) && !requiredSteps[1].fields.includes(f));
                    });

                    data.steps = requiredSteps;
                } else {
                    // Default fields for a brand new form
                    requiredSteps[0].fields = [
                        { id: 'f-1', type: 'text', label: 'First Name', required: true, placeholder: 'Enter first name...' },
                        { id: 'f-2', type: 'text', label: 'Last Name', required: true, placeholder: 'Enter last name...' },
                        { id: 'f-3', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter email address...' },
                    ];
                    requiredSteps[1].fields = [
                        { id: 'f-5', type: 'text', label: 'Address Line 1', required: true, placeholder: 'Enter address line 1...' },
                        { id: 'f-7', type: 'text', label: 'City', required: true, placeholder: 'Enter city...' },
                    ];
                    requiredSteps[2].fields = [
                        { id: 'f-12', type: 'textarea', label: 'Additional Message', required: false, placeholder: 'Enter any additional details...' },
                    ];
                    data.steps = requiredSteps;
                }

                setFormState(data);
            } catch (err) {
                console.error("Fetch form error", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchForm();
    }, []);

    useEffect(() => {
        if (!isPlanLoading) {
            setCanEdit(hasPermission('form_builder'));
        }
    }, [isPlanLoading, hasPermission]);

    const handleSave = async () => {
        if (!formState) return;
        setIsSaving(true);
        try {
            await updateForm(formState);
            if (typeof shopify !== 'undefined') shopify.toast.show('Form configuration saved');
        } catch (err) {
            console.error("Save form error", err);
            if (typeof shopify !== 'undefined') shopify.toast.show('Failed to save form', { isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        formState,
        setFormState,
        isLoading: isLoading || isPlanLoading,
        isSaving,
        selectedTab,
        setSelectedTab,
        canEdit,
        handleSave,
    };
}
