import React, { useState } from 'react';

interface EditDecodedMessageProps {
    message: string;
    setMessage: (newMessage: string) => void;
    className?: string;
}

export default function EditDecodedMessage({ message, setMessage, className }: EditDecodedMessageProps) {
    const [parsedMessage, setParsedMessage] = useState<Record<string, string>>(JSON.parse(message));
    const [editingKey, setEditingKey] = useState<string | null>(null);

    const handleValueChange = (key: string, newValue: string) => {
        const updatedMessage = { ...parsedMessage, [key]: newValue };
        setParsedMessage(updatedMessage);
        setMessage(JSON.stringify(updatedMessage, null, 2));
    };

    const handleEditStart = (key: string) => {
        setEditingKey(key);
    };

    const handleEditEnd = () => {
        setEditingKey(null);
    };

    return (
        <div className={className}>
            <table className="w-full border-collapse">
                <tbody>
                    {Object.entries(parsedMessage).map(([key, value]) => (
                        <tr key={key} className="border-b">
                            <td className="py-2 px-4 text-sm font-medium capitalize w-1/3 bg-gray-50">
                                {key.replace(/_/g, ' ')}
                            </td>
                            <td className="py-2 px-4 text-sm">
                                {editingKey === key ? (
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleValueChange(key, e.target.value)}
                                        onBlur={handleEditEnd}
                                        autoFocus
                                        className="w-full px-2 py-1 border rounded bg-white"
                                    />
                                ) : (
                                    <span
                                        onClick={() => handleEditStart(key)}
                                        className="cursor-pointer block w-full"
                                    >
                                        {value !== 'Null' ? value : 'N/A'}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
