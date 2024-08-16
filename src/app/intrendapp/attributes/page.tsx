"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import TagInput from '../../components/TagInput';
import Button from '../../components/Button';

interface Attributes {
  fiber: string[];
  width: string[];
  content: string[];
  type: string[];
  certifications: string[];
  approvals: string[];
  weave: string[];
  weave_type: string[];
  designs: string[];
  paymnent_terms: string[];
  delivery_destination: string[];
  delivery_terms: string[];
  group: Record<string, string>;
  fabric_type: string[];
}

interface AttributeResponse {
  attributes: {
    _id: string;
    DefaultAttributes: Attributes;
  };
}

const AttributesPage: React.FC = () => {
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Attributes>({
    fiber: [],
    width: [],
    content: [],
    type: [],
    certifications: [],
    approvals: [],
    weave: [],
    weave_type: [],
    designs: [],
    paymnent_terms: [],
    delivery_destination: [],
    delivery_terms: [],
    group: {},
    fabric_type: [],
  });
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [newGroupKey, setNewGroupKey] = useState('');
  const [newGroupValue, setNewGroupValue] = useState('');

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/attributes`);
      const data: AttributeResponse = await response.json();
      setAttributes(data.attributes.DefaultAttributes);
      setFormData(data.attributes.DefaultAttributes);
      initializeInputValues(data.attributes.DefaultAttributes);
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };

  const initializeInputValues = (attrs: Attributes) => {
    const newInputValues: Record<string, string> = {};
    Object.keys(attrs).forEach(key => {
      if (key !== 'group') {
        newInputValues[key] = '';
      }
    });
    setInputValues(newInputValues);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (category: keyof Attributes, value: string) => {
    if (category !== 'group') {
      setFormData(prev => ({
        ...prev,
        [category]: [...(prev[category] as string[]), value],
      }));
      setInputValues(prev => ({ ...prev, [category]: '' }));
    }
  };

  const handleDeleteTag = (category: keyof Attributes, index: number) => {
    if (category !== 'group') {
      setFormData(prev => ({
        ...prev,
        [category]: (prev[category] as string[]).filter((_, i) => i !== index),
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      // Check if group has been modified
      const groupChanged = JSON.stringify(attributes?.group) !== JSON.stringify(formData.group);
      
      if (groupChanged) {
        // Update group
        const groupResponse = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/update_group/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ update_dict: formData.group }),
        });
        if (!groupResponse.ok) {
          throw new Error('Failed to update group');
        }
      }
  
      // Prepare data for attribute update
      const attributeUpdateData = { ...formData };
  
      // Type guard function
      const isArrayAttribute = (key: keyof Attributes): key is Exclude<keyof Attributes, 'group'> => {
        return key !== 'group';
      };
  
      // Iterate over keys and update array attributes
      (Object.keys(attributeUpdateData) as Array<keyof Attributes>).forEach(key => {
        if (isArrayAttribute(key)) {
          attributeUpdateData[key] = Array.from(new Set(attributeUpdateData[key]));
        }
      });
  
      // Update all attributes
      const attributeResponse = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributes: attributeUpdateData }),
      });
  
      if (!attributeResponse.ok) {
        throw new Error('Failed to update attributes');
      }
  
      const updatedAttributes: AttributeResponse = await attributeResponse.json();
      if (updatedAttributes.attributes && updatedAttributes.attributes.DefaultAttributes) {
        setAttributes(updatedAttributes.attributes.DefaultAttributes);
      }
  
      setEditMode(false);
      setShowPopup(true);
    } catch (error) {
      console.error('Error updating attributes:', error);
    }
  };

  const handleAddNewGroup = () => {
    if (newGroupKey && newGroupValue) {
      setFormData(prev => ({
        ...prev,
        group: { ...prev.group, [newGroupKey]: newGroupValue }
      }));
      setNewGroupKey('');
      setNewGroupValue('');
    }
  };

  const closePopup = () => setShowPopup(false);

  if (!attributes) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Attributes</h1>
      {editMode ? (
        <form className="space-y-4" onSubmit={(e: FormEvent) => e.preventDefault()}>
          {Object.entries(formData).map(([category, value]) => (
            <div key={category}>
              <label className="block text-gray-700">{category}</label>
              {category !== 'group' ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(value as string[]).map((item, index) => (
                      <span key={index} className="bg-blue-200 px-2 py-1 rounded-full flex items-center">
                        {item}
                        <button
                          type="button"
                          className="ml-2 text-red-500"
                          onClick={() => handleDeleteTag(category as keyof Attributes, index)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <TagInput
                    label=""
                    name={category}
                    value={inputValues[category]}
                    placeholder={`Add a new ${category}`}
                    onChange={handleInputChange}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (inputValues[category]?.trim()) {
                          handleChange(category as keyof Attributes, inputValues[category].trim());
                        }
                      }
                    }}
                  />
                </>
              ) : (
                <div>
                  {Object.entries(value as Record<string, string>).map(([key, val]) => (
                    <div key={key} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          const newGroup = { ...formData.group };
                          delete newGroup[key];
                          newGroup[e.target.value] = val;
                          setFormData(prev => ({ ...prev, group: newGroup }));
                        }}
                        className="mr-2 p-2 border rounded"
                      />
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            group: { ...prev.group, [key]: e.target.value }
                          }));
                        }}
                        className="mr-2 p-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newGroup = { ...formData.group };
                          delete newGroup[key];
                          setFormData(prev => ({ ...prev, group: newGroup }));
                        }}
                        className="text-red-500"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      value={newGroupKey}
                      onChange={(e) => setNewGroupKey(e.target.value)}
                      placeholder="New group key"
                      className="mr-2 p-2 border rounded"
                    />
                    <input
                      type="text"
                      value={newGroupValue}
                      onChange={(e) => setNewGroupValue(e.target.value)}
                      placeholder="New group value"
                      className="mr-2 p-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewGroup}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Button type="button" onClick={handleUpdate} className="w-full">
            Update Attributes
          </Button>
        </form>
      ) : (
        <div>
          {Object.entries(attributes).map(([category, value]) => (
            <div key={category} className="mb-4">
              <h2 className="text-xl font-semibold mb-2">{category}</h2>
              <div className="flex flex-wrap gap-2">
                {category !== 'group' ? (
                  (value as string[]).map((item, index) => (
                    <span key={index} className="bg-blue-200 px-2 py-1 rounded-full">
                      {item}
                    </span>
                  ))
                ) : (
                  Object.entries(value as Record<string, string>).map(([key, val]) => (
                    <span key={key} className="bg-blue-200 px-2 py-1 rounded-full">
                      {key}: {val}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
          <Button type="button" onClick={() => setEditMode(true)} className="mt-4">
            Edit Attributes
          </Button>
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-2">Attributes updated successfully!</h2>
            <Button onClick={closePopup}>OK</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributesPage;