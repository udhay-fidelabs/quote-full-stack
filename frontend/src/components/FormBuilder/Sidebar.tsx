import React, { useState } from 'react';
import {
    Divider,
    Icon,
    Text,
} from '@shopify/polaris';
import {
    SearchIcon,
    SelectIcon,
    TextBlockIcon,
    TextIcon,
    TextTitleIcon,
    UploadIcon,
    CashDollarIcon,
    ClipboardChecklistIcon,
} from '@shopify/polaris-icons';
import { useDraggable } from '@dnd-kit/core';

export interface SidebarElementDef {
    type: string;
    label: string;
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    color?: string;
}

const BASIC_ELEMENTS: SidebarElementDef[] = [
    { type: 'text', label: 'Full Name' },
    { type: 'email', label: 'Email Address' },
    { type: 'phone', label: 'Phone Number' },
    { type: 'text', label: 'City' },
    { type: 'text', label: 'State' },
    { type: 'text', label: 'Pincode' },
    { type: 'text', label: 'Country' },
    { type: 'textarea', label: 'Message' },
];

const CUSTOM_ELEMENTS: SidebarElementDef[] = [
    { type: 'text', label: 'Single Line', icon: TextIcon, color: '#5c5f62' },
    { type: 'textarea', label: 'Paragraph', icon: TextBlockIcon, color: '#5c5f62' },
    { type: 'heading', label: 'Heading', icon: TextTitleIcon, color: '#5c5f62' },
    { type: 'select', label: 'Dropdown', icon: SelectIcon, color: '#5c5f62' },
    { type: 'checkbox', label: 'Checkbox', icon: ClipboardChecklistIcon, color: '#5c5f62' },
    { type: 'radio', label: 'Single Choice', icon: SelectIcon, color: '#5c5f62' },
    { type: 'file', label: 'File Upload', icon: UploadIcon, color: '#5c5f62' },
    { type: 'price', label: 'Price Field', icon: CashDollarIcon, color: '#5c5f62' },
];

export function parseSidebarDragId(id: string): { type: string; label: string } | null {
    const parts = id.split('::');
    if (parts[0] !== 'sidebar' || parts.length < 3) return null;
    return { type: parts[1], label: parts[2] };
}

interface DraggableTileProps {
    el: SidebarElementDef;
    withIcon: boolean;
}

const DraggableTile: React.FC<DraggableTileProps> = ({ el, withIcon }) => {
    const dragId = `sidebar::${el.type}::${el.label}`;
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: dragId,
        data: { type: 'sidebar', elementType: el.type, elementLabel: el.label },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`group select-none touch-none ${isDragging ? 'opacity-40' : 'opacity-100'}`}
        >
            <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl cursor-grab transition-all duration-200 hover:border-indigo-400 hover:shadow-md active:scale-95 active:shadow-inner">
                {withIcon && el.icon ? (
                    <div className="w-8 h-8 mb-2 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <Icon source={el.icon} tone="subdued" />
                    </div>
                ) : null}
                <span className="text-[11px] font-semibold text-gray-600 group-hover:text-indigo-600 text-center leading-tight">
                    {el.label}
                </span>
            </div>
        </div>
    );
};

interface SidebarProps {
    onAddElement: (type: string, label: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddElement: _onAddElement }) => {
    const [search, setSearch] = useState('');

    const filtered = (arr: SidebarElementDef[]) =>
        arr.filter(e => e.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="h-full bg-gray-50/50 border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-white">
                <Text variant="headingMd" as="h2">Form Elements</Text>
                <p className="text-xs text-gray-400 mt-1">Drag and drop elements to your form</p>

                <div className="mt-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon source={SearchIcon} tone="subdued" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search elements..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-hide">
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Essentials
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {filtered(BASIC_ELEMENTS).map(el => (
                            <DraggableTile key={el.label} el={el} withIcon={false} />
                        ))}
                    </div>
                </div>

                <Divider />

                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Form Controls
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {filtered(CUSTOM_ELEMENTS).map(el => (
                            <DraggableTile key={el.label} el={el} withIcon={true} />
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mt-4">
                    <Text variant="bodyXs" as="p" tone="subdued" alignment="center">
                        Tip: You can drag these elements into any step in the builder.
                    </Text>
                </div>
            </div>
        </div>
    );
};
