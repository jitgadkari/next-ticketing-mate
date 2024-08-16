"use client";

import { useState, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
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
  group: string[];
}

interface AttributeResponse {
  attributes: {
    _id: string;
    DefaultAttributes: Attributes;
  };
}

const AttributesPage = () => {
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
    group: [],
  });
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    fiber: '',
    width: '',
    content: '',
    type: '',
    certifications: '',
    approvals: '',
    weave: '',
    weave_type: '',
    designs: '',
    paymnent_terms: '',
    delivery_destination: '',
    delivery_terms: '',
    group: '',
  });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/attributes`);
        const data: AttributeResponse = await response.json();
        setAttributes(data.attributes.DefaultAttributes);
        setFormData(data.attributes.DefaultAttributes);
        setInputValues(Object.keys(data.attributes.DefaultAttributes).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {} as Record<string, string>));
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    };
    fetchAttributes();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues(prevInputValues => ({
      ...prevInputValues,
      [name]: value,
    }));
  };

  const handleChange = (category: keyof Attributes, value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [category]: [...prevFormData[category], value],
    }));
    setInputValues(prevInputValues => ({
      ...prevInputValues,
      [category]: '',
    }));
  };

  const handleDeleteTag = (category: keyof Attributes, index: number) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [category]: prevFormData[category].filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/attributes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attributes: formData }),
      });

      if (response.ok) {
        const updatedAttributes: AttributeResponse = await response.json();
        if (updatedAttributes.attributes && updatedAttributes.attributes.DefaultAttributes) {
          setAttributes(updatedAttributes.attributes.DefaultAttributes);
        }
        setEditMode(false);
        setShowPopup(true);
      } else {
        const errorData = await response.json();
        console.error('Failed to update attributes', errorData);
      }
    } catch (error) {
      console.error('Error updating attributes:', error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  if (!attributes) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Attributes</h1>
      {editMode ? (
        <form className="space-y-4" onSubmit={(e: FormEvent) => e.preventDefault()}>
          {Object.keys(formData).map((category) => (
            <div key={category}>
              <label className="block text-gray-700">{category}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData[category as keyof Attributes] as string[]).map((item, index) => (
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
                    if (inputValues[category].trim()) {
                      handleChange(category as keyof Attributes, inputValues[category].trim());
                    }
                  }
                }}
              />
            </div>
          ))}
          <Button type="button" onClick={handleUpdate} className="w-full">
            Update Attributes
          </Button>
        </form>
      ) : (
        <div>
          {Object.keys(attributes).map((category) => (
            <div key={category} className="mb-4">
              <h2 className="text-xl font-semibold mb-2">{category}</h2>
              <div className="flex flex-wrap gap-2">
                {(attributes[category as keyof Attributes] as string[]).map((item, index) => (
                  <span key={index} className="bg-blue-200 px-2 py-1 rounded-full">
                    {item}
                  </span>
                ))}
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
