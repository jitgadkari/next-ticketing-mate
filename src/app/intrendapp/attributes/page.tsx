"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from "react";
import TagInput from "../../components/TagInput";
import Button from "../../components/Button";
import { FaEdit } from "react-icons/fa";

interface Attributes {
  [key: string]: string[];
}

interface AttributeVersion {
  attributes: Attributes;
  timestamp: string;
  version_note?: string;
}

interface AttributeResponse {
  latest: AttributeVersion;
  versions: AttributeVersion[];
}

const AttributesPage: React.FC = () => {
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Attributes>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [attributeHistory, setAttributeHistory] = useState<AttributeVersion[]>([]);
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/attributes`
      );
      const data = await response.json();
      console.log(data)
      if (data && data.attributes.attributes) {
        setAttributes(data.attributes.attributes);
        setFormData(data.attributes.attributes);
        initializeInputValues(data.attributes.attributes);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  const initializeInputValues = (attrs: Attributes) => {
    const newInputValues: Record<string, string> = {};
    Object.keys(attrs).forEach((key) => {
      newInputValues[key] = "";
    });
    setInputValues(newInputValues);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (category: string, value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), value.trim()],
    }));
    setInputValues((prev) => ({ ...prev, [category]: "" }));
  };

  const handleDeleteTag = (category: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddNewAttribute = () => {
    if (newAttributeKey && newAttributeValue) {
      setFormData((prev) => ({
        ...prev,
        [newAttributeKey]: [newAttributeValue],
      }));
      setNewAttributeKey("");
      setNewAttributeValue("");
    }
  };

  const handleUpdate = async () => {
    try {
      const versionNote = `Updated attributes on ${new Date().toLocaleString()}`;
      const method = attributes ? 'PUT' : 'POST';
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/attributes?userId=50d2ce0a-263f-40d6-a354-922101b00320&userAgent=user-test`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            attributes: formData,
            version_note: versionNote
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update attributes");
      }

      await fetchAttributes();
      setEditMode(false);
      setShowPopup(true);
    } catch (error) {
      console.error("Error updating attributes:", error);
    }
  };

  const closePopup = () => setShowPopup(false);

  const fetchAttributeHistory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/attributes/history`
      );
      const data = await response.json();
      console.log(data);
      setAttributeHistory(data.versions);
    } catch (error) {
      console.error("Error fetching attribute history:", error);
    }
  };

  const switchToVersion = (version: AttributeVersion) => {
    setAttributes(version.attributes);
    setFormData(version.attributes);
    initializeInputValues(version.attributes);
    setShowHistory(false);
    setEditMode(false);
  };

  if (!attributes) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-white rounded shadow text-black">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Attributes Management</h1>
          <Button onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) {
              fetchAttributeHistory();
            }
          }}>
            {showHistory ? "Hide History" : "Show Version History"}
          </Button>
        </div>
        {!showHistory && (
          <Button onClick={() => setEditMode(!editMode)}>
            {editMode ? "Cancel" : "Edit Attributes"}
          </Button>
        )}
      </div>

      {showHistory ? (
        <div className="space-y-4">
          {attributeHistory.map((version, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="font-semibold">
                    Version from {new Date(version.timestamp).toLocaleString()}
                  </span>
                  {version.version_note && (
                    <p className="text-gray-600 text-sm mt-1">
                      Note: {version.version_note}
                    </p>
                  )}
                </div>
                <Button onClick={() => switchToVersion(version)}>
                  Switch to This Version
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(version.attributes).map(([category, values]) => (
                  <div key={category} className="p-3 bg-white rounded shadow-sm">
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-1">
                      {values.map((value, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {editMode ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(formData).map(([category, values]) => (
                  <div key={category} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {values.map((value, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                        >
                          {value}
                          <button
                            onClick={() => handleDeleteTag(category, index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name={category}
                        value={inputValues[category]}
                        onChange={handleInputChange}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleChange(category, inputValues[category]);
                          }
                        }}
                        placeholder={`Add to ${category}`}
                        className="flex-1 p-2 border rounded"
                      />
                      <Button
                        onClick={() => handleChange(category, inputValues[category])}
                        className="px-4"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4">Add New Attribute Category</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newAttributeKey}
                    onChange={(e) => setNewAttributeKey(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={newAttributeValue}
                    onChange={(e) => setNewAttributeValue(e.target.value)}
                    placeholder="Initial value"
                    className="flex-1 p-2 border rounded"
                  />
                  <Button onClick={handleAddNewAttribute}>Add Category</Button>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={handleUpdate} className="w-full">
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(attributes ?? {}).map(([category, values]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(values) ? values : []).map((value, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Success!</h2>
            <p>Attributes have been updated successfully.</p>
            <Button onClick={closePopup} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributesPage;