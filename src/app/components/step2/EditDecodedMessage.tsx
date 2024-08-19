import React, { useState } from 'react';

interface EditDecodedMessageProps {
    message: string;
    setMessage: (newMessage: string) => void;
}

export default function EditDecodedMessage({ message, setMessage }: EditDecodedMessageProps) {
    // Parse the JSON message and manage the state
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
        <div>
            <div className="bg-white rounded-md shadow-md mt-4">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <tbody>
                            {Object.entries(parsedMessage).map(([key, value]) => (
                                <tr key={key} className="border-b">
                                    <td className="px-4 py-2 font-medium text-gray-700 bg-gray-50">
                                        {key.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-4 py-2 text-gray-800">
                                        {editingKey === key ? (
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                onBlur={handleEditEnd}
                                                autoFocus
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        ) : (
                                            <span
                                                onClick={() => handleEditStart(key)}
                                                className="cursor-pointer"
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
            </div>
        </div>
    );
}
