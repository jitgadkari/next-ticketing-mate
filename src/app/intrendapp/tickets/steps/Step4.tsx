"use client";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import MultiSelect, {
  MultiSelectOption,
} from "../../../components/MultiSelect";
import { MultiValue } from "react-select";
import { FaChessKing, FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import toast from "react-hot-toast";

interface VendorGroup {
  [key: string]: string;
}

interface Vendor {
  id: string;
  name: string;
  group: VendorGroup | string;
  email: string;
  phone?: string;
  whatsapp_groups?: Array<{ id: string; name: string }>;
  isFiltered?: boolean;
  match_score?: number;
}

interface VendorData {
  name: string;
  vendor_id: string;
  message_temp?: string;
  message_sent?: boolean;
}

interface Step4Props {
  ticketNumber: string;
  selectedVendors: string[];
  selectedVendors1: {
    vendors?: Record<string, VendorData>;
  };
  template: string;
  setActiveStep: (step: string) => void;
  fetchTicket: (ticketId: string) => Promise<void>;
  ticket: {
    id: string;
    ticket_number: string;
    customer_name: string;
    customer_id: string;
    current_step: string;
    steps: Record<string, any>;
    created_date: string;
    updated_date: string;
  };
  isCurrentStep: boolean;
}

const Step4: React.FC<Step4Props> = ({
  ticketNumber,
  selectedVendors,
  selectedVendors1,
  template,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  console.log(
    "Step 3 latest template:",
    ticket.steps["Step 3 : Message Template for vendors"]?.latest
      ?.vendor_message_temp
  );
  interface StepVersion {
    time: string;
    vendors: Record<string, VendorData>;
  }

  const stepData = ticket.steps[ticket.current_step] || {};
  console.log(stepData);
  const versions = Array.isArray(stepData.versions) ? stepData.versions : [];
  console.log(versions);
  // Add latest version to the versions array for unified handling
  const allVersions = [
    {
      version: "latest",
      time: stepData.latest?.time || "No timestamp",
      vendors: stepData.latest?.vendors || {},
    },
    ...versions.map((v: StepVersion, index: number) => ({
      version: `${v.time || "unknown"}_${index}`, // Add index to ensure uniqueness
      time: v.time || "No timestamp",
      vendors: v.vendors || {},
    })),
  ].filter((v) => v.time && typeof v.time === "string");

  // Sort versions by time in descending order (newest first)
  allVersions.sort((a, b) => {
    if (a.time === "No timestamp") return -1;
    if (b.time === "No timestamp") return 1;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  const [selectedVersion, setSelectedVersion] = useState<string>("latest");

  const formatTime = (timestamp: string) => {
    if (timestamp === "No timestamp") return timestamp;
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleVersionChange = (version: string) => {
    if (isCurrentStep) {
      setSelectedVersion(version);
      const selectedVersionData = allVersions.find(
        (v) => v.version === version
      );
      if (selectedVersionData) {
        // Get vendor data from the selected version
        const vendors = selectedVersionData.vendors || {};

        // Update selected options
        const selectedVendorOptions = (
          Object.entries(vendors) as Array<[string, VendorData]>
        ).map(([id, vendorData]) => ({
          label: vendorData.name,
          value: vendorData.name,
          id: vendorData.vendor_id,
        }));
        console.log("selectedVendorOptions:", selectedVendorOptions);
        setSelectedOptions(selectedVendorOptions);

        // Update vendor messages
        const newMessages: Record<string, string> = {};
        (Object.entries(vendors) as Array<[string, VendorData]>).forEach(
          ([id, vendorData]) => {
            if (vendorData.message_temp) {
              newMessages[vendorData.name] = vendorData.message_temp;
            }
          }
        );
        setVendorMessages(newMessages);

        // Trigger a re-fetch of vendors to ensure consistency
        fetchVendors();
      }
    }
  };

  const [vendors, setVendors] = useState<MultiSelectOption[]>([]);
  console.log("selectedVendors:", selectedVendors);
  console.log("selectedVendors1:", selectedVendors1);
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(
    Object.entries(selectedVendors1.vendors || {}).map(
      ([id, vendor]: [string, VendorData]) => ({
        label: vendor.name,
        value: vendor.name,
        id: vendor.vendor_id,
      })
    )
  );
  console.log("selectedOptions:", selectedOptions);
  const [vendorMessages, setVendorMessages] = useState<Record<string, string>>(
    {}
  );
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showReminderPopUp, setShowReminderPopUp] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<Vendor[]>([]);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isWhatsAppSending, setIsWhatsAppSending] = useState(false);
  const [emailSendingStatus, setEmailSendingStatus] = useState<
    Record<string, string>
  >({});
  const [whatsappSendingStatus, setWhatsappSendingStatus] = useState<
    Record<string, string>
  >({});
  const [isMessageSent, setIsMessageSent] = useState({
    emailSent: false,
    whatsappMessageSent: false,
  });
  const [showResendWhatsappMessage, setShowResendWhatsappMessage] =
    useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [vendorGroupOptions, setVendorGroupOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const handleNext = async (updatedVendors: string[]) => {
    console.log("Handling next for Step 4");

    // Check if any messages are unsent
    const currentVendors =
      ticket.steps[ticket.current_step]?.latest?.vendors || {};
    let hasUnsentEmail = false;
    let hasUnsentWhatsapp = false;

    selectedOptions.forEach((option) => {
      const vendor = vendorDetails.find((v: Vendor) => v.name === option.value);
      if (!vendor) return;
      const vendorData = currentVendors[vendor.id];
      console.log("Checking vendor data for", vendor.name, vendorData);

      // Check if message_sent is boolean (old format) or object (new format)
      if (typeof vendorData?.message_sent === "object") {
        if (!vendorData?.message_sent?.email) hasUnsentEmail = true;
        if (!vendorData?.message_sent?.whatsapp) hasUnsentWhatsapp = true;
      } else {
        // If using old format or no messages sent
        if (!vendorData?.message_sent) {
          hasUnsentEmail = true;
          hasUnsentWhatsapp = true;
        }
      }
    });

    // Update message sent status
    setIsMessageSent({
      emailSent: !hasUnsentEmail,
      whatsappMessageSent: !hasUnsentWhatsapp,
    });

    // If any messages are unsent, show the reminder popup
    if (hasUnsentEmail || hasUnsentWhatsapp) {
      setShowReminderPopUp(true);
      return;
    }

    // If all messages are sent, proceed with the update
    setLoading(true);
    try {
      const vendorsToUpdate = updatedVendors.map((vendorName) => {
        const vendor = vendorDetails.find((v: Vendor) => v.name === vendorName);
        const currentVendorData = currentVendors[vendor?.id || ""] || {};

        return {
          vendor_id: vendor?.id,
          name: vendorName,
          message_temp: vendorMessages[vendorName] || "",
          message_sent: currentVendorData.message_sent || {
            whatsapp: false,
            email: false,
          },
        };
      });

      // Save Step 4 data
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: vendorsToUpdate },
            step_number: ticket.current_step,
          }),
        }
      );

      // Initialize Step 5 with empty responses
      const step5VendorsObj = selectedOptions.reduce((acc, option) => {
        const vendor = vendorDetails.find((v) => v.name === option.value);
        if (!vendor) return acc;

        acc[vendor.id] = {
          name: option.value,
          response_received: false,
          response_message: "",
        };
        return acc;
      }, {} as Record<string, any>);

      // Update next step
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_next_step?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: step5VendorsObj },
            step_number: ticket.current_step,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update next step: ${response.status}`);
      }

      await fetchTicket(ticket.id);
      setActiveStep("Step 5 : Messages from Vendors");
      toast.success("Step 4 completed");
    } catch (error) {
      console.error("Error updating steps:", error);
      toast.error("Failed to proceed to next step");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedVendors: string[]) => {
    const existingVendors =
      ticket.steps[ticket.current_step]?.latest?.vendors || {};

    const vendorsObject: Record<string, any> = { ...existingVendors };

    updatedVendors.forEach((vendorName) => {
      const vendor = vendorDetails.find((v) => v.name === vendorName);
      if (!vendor || !vendor.id) return;

      vendorsObject[vendor.id] = {
        vendor_id: vendor.id,
        name: vendorName,
        message_temp: vendorMessages[vendorName] || "",
        message_sent: vendorsObject[vendor.id]?.message_sent ??
          ticket.steps[ticket.current_step]?.latest?.vendors?.[vendor.id]
            ?.message_sent ?? {
            email: false,
            whatsapp: false,
          },
      };
    });

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: vendorsObject },
            step_number: ticket.current_step,
          }),
        }
      );

      await fetchTicket(ticket.id);
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error updating Step 4:", error);
      toast.error("Failed to save changes");
    }
  };

  useEffect(() => {
    const allGroups: { id: string; name: string }[] = [];
    console.log("Selected options:", selectedOptions);
    selectedOptions.forEach((option) => {
      const vendor = vendorDetails.find((v) => v.name === option.value);
      if (vendor?.whatsapp_groups?.length) {
        vendor.whatsapp_groups.forEach((group) => {
          if (!allGroups.find((g) => g.id === group.id)) {
            allGroups.push(group);
          }
        });
      }
    });

    setVendorGroupOptions(allGroups);
  }, [selectedOptions, vendorDetails]);

  // Initialize version data and vendor messages when component mounts
  useEffect(() => {
    const currentStepData = ticket.steps[ticket.current_step] || {};
    const currentVersions = currentStepData.versions || [];
    const latestVersion = currentStepData.latest;

    if (latestVersion?.vendors) {
      // Initialize with latest version's data
      const vendors = latestVersion.vendors;
      const newMessages: Record<string, string> = {};
      const newSelectedOptions = Object.entries(
        vendors as Record<string, VendorData>
      ).map(([id, vendor]) => {
        if (vendor.message_temp) {
          newMessages[vendor.name] = vendor.message_temp;
        }
        return {
          label: vendor.name,
          value: vendor.name,
          id: vendor.vendor_id || id,
        };
      });
      console.log("Loading saved vendor data:", newSelectedOptions);
      setSelectedOptions(newSelectedOptions);
      setVendorMessages(newMessages);
      setSelectedVersion("latest");
    }
  }, [ticket.steps, ticket.current_step]);

  // Update vendor messages when selected version changes
  useEffect(() => {
    const currentStepData = ticket.steps[ticket.current_step] || {};
    const selectedVersionData =
      selectedVersion === "latest"
        ? currentStepData.latest
        : (currentStepData.versions || []).find(
            (v: StepVersion) => v.time === selectedVersion
          );

    if (selectedVersionData) {
      const vendors = selectedVersionData.vendors || {};
      const newMessages: Record<string, string> = {};

      // Update messages for currently selected vendors
      selectedOptions.forEach((option) => {
        const vendorData = vendors[option.id as string];
        if (vendorData?.message_temp) {
          newMessages[vendorData.name] = vendorData.message_temp;
        } else {
          // Keep existing message if available, otherwise empty string
          newMessages[option.value] = vendorMessages[option.value] || "";
        }
      });

      // Only update if messages have changed
      const currentMessages = JSON.stringify(vendorMessages);
      const updatedMessages = JSON.stringify(newMessages);
      if (currentMessages !== updatedMessages) {
        setVendorMessages(newMessages);
      }
    }
  }, [
    selectedOptions,
    ticket.steps,
    ticket.current_step,
    vendorMessages,
    selectedVersion,
  ]);

  useEffect(() => {
    // Call fetchVendors when decoded messages are available
    const decodedMessages =
      ticket.steps["Step 2 : Message Decoded"]?.latest?.decoded_messages;
    if (decodedMessages) {
      console.log("Decoded messages available, fetching filtered vendors...");
      fetchVendors();
    }
  }, [ticket.steps]);

  console.log("selectedOptions", selectedOptions);
  console.log("template", template);
  useEffect(() => {
    if (selectedOptions.length > 0) {
      console.log("Selected options:", selectedOptions);
      generateVendorMessages();
    }
  }, [selectedOptions]);

  const sendVendorGroupMessage = async () => {
    if (!selectedGroup) {
      toast.error("Please select a group.");
      return;
    }

    const groupId = selectedGroup.endsWith("@g.us")
      ? selectedGroup
      : `${selectedGroup}@g.us`;

    try {
      const payload = {
        to: groupId,
        content: template,
      };
      console.log("payload", payload);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/send-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: groupId,
            content: template,
          }),
        }
      );

      const result = await response.json();
      console.log("Group Send result:", result);

      if (!response.ok) {
        toast.error(`HTTP Error: ${response.status}`);
        console.error("Error body:", await response.text());
        return;
      }

      if (result.success) {
        toast.success("Message sent to WhatsApp group!");
        console.log("✅ Group message success:", result.message);
      } else {
        toast.error("Message API returned failure");
        console.error("❌ WhatsApp API failed:", result);
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error("Failed to send group message");
      console.error("❌ Send error:", err.message || err);
    }
  };

  const fetchVendors = async (searchName?: string) => {
    console.log("Fetching vendors...");
    try {
      let vendorData: any[] = [];

      if (searchName?.trim()) {
        // Use the search API when a search name is provided
        const searchResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_ENDPOINT_URL
          }/api/vendors/name?name=${encodeURIComponent(searchName.trim())}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!searchResponse.ok) {
          throw new Error(`HTTP error! status: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        console.log("Search response:", searchData);
        // Handle nested vendors object structure
        const vendorsResult = searchData.vendors?.vendors || searchData.vendors;
        vendorData = Array.isArray(vendorsResult)
          ? vendorsResult
          : [vendorsResult];
      }

      // If no search data found, or no searchName is given, use the filtered API
      if (!vendorData.length) {
        console.log("Fetching filtered vendors...");

        // Get decoded messages from Step 2
        const decoded_messages =
          ticket.steps["Step 2 : Message Decoded"]?.latest?.decoded_messages ||
          {};
        console.log("Decoded messages:", decoded_messages);

        // Clean and prepare the decoded messages
        const cleanDecodedMessages = Object.entries(decoded_messages).reduce(
          (acc, [key, value]) => {
            if (value && value !== "Null" && value !== "null" && value !== "") {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, any>
        );

        // Prepare filters dictionary
        const filters_dict: Record<string, string[]> = {};

        // Add certifications if present
        if (cleanDecodedMessages.certifications) {
          filters_dict.certifications = cleanDecodedMessages.certifications
            .split(",")
            .map((cert: string) => cert.trim());
        }

        // Add fabric type if present
        if (cleanDecodedMessages.fabric_type) {
          filters_dict.fabric_type = [cleanDecodedMessages.fabric_type];
        }

        // Add weave if present
        if (cleanDecodedMessages.weave) {
          filters_dict.weave = [cleanDecodedMessages.weave];
        }

        console.log("Filters dictionary:", filters_dict);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/filter/attribute`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ filters_dict }),
          }
        );
        console.log(
          "👉 Fetching with attribute filter payload:",
          JSON.stringify({ filters_dict }, null, 2)
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const vendorsData = await response.json();
        console.log("Fetched vendors:", vendorsData);

        // Handle both array and object response formats
        vendorData = Array.isArray(vendorsData.vendors)
          ? vendorsData.vendors
          : Object.values(vendorsData.vendors || {});
        console.log("Vendor data from API:", vendorData);
      }

      // Map vendors ensuring all required fields
      const vendorsList = vendorData
        .filter((v: any) => v && (v.id || v.vendor_id)) // Ensure we have an ID
        .map((v: any): Vendor => {
          const vendorId = v.vendor_id || v.id;
          const vendorName =
            v.name ||
            ticket.steps[ticket.current_step]?.latest?.vendors?.[vendorId]
              ?.name ||
            "Unnamed Vendor";

          const existingVendor =
            ticket.steps[ticket.current_step]?.latest?.vendors?.[vendorId];

          return {
            id: vendorId,
            name: vendorName,
            group: v.attributes || v.group || "",
            email: v.email || existingVendor?.email || "",
            phone: v.phone || existingVendor?.phone || "",
            whatsapp_groups: v.whatsapp_groups || [],
            isFiltered: !searchName, // ✅ True only for attribute-filtered vendors
            match_score: v.match_score || 0,
          };
        });

      const filteredVendors = vendorsList.filter((v) => v.isFiltered);
      console.log(
        "✅ Filtered vendors:",
        filteredVendors.map((v) => v.name)
      );

      if (vendorsList.length > 0) {
        console.log("Setting vendors in dropdown...");
        // Use existing vendor data from ticket if available
        const vendorOptions = vendorsList.map((vendor: Vendor) => {
          const score = vendor.match_score || 0;
          const displayName = `${vendor.name}${
            score > 0 ? ` (Score: ${score})` : ""
          }`;
          return {
            label: displayName,
            value: vendor.name,
            id: vendor.id,
            isFiltered: score > 0,
            match_score: score, // ✅ add this for access in custom render
          };
        });

        console.log("Final vendor options:", vendorOptions);
        setVendors(vendorOptions);
        setVendorDetails(vendorsList);
      } else {
        console.log("No valid vendors found");
        // toast.error("No valid vendors available");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to fetch vendors. Please try again.");
    }
  };
  const fetchVendorDetailsById = async (vendorId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/${vendorId}`
      );
      if (!response.ok) throw new Error("Failed to fetch vendor details");

      const data = await response.json();
      return data.vendor;
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      toast.error("Failed to fetch vendor info");
      return null;
    }
  };

  const handleVendorMessageChange = (vendorName: string, message: string) => {
    setVendorMessages((prev) => {
      const newMessages = { ...prev };
      newMessages[vendorName] = message;
      return newMessages;
    });
  };

  const generateVendorMessages = async () => {
    const messages: Record<string, string> = {};
    const customerMessage =
      ticket.steps["Step 1 : Customer Message Received"]?.latest?.text;
    const decodedMessages =
      ticket.steps["Step 2 : Message Decoded"]?.latest?.decoded_messages || {};

    for (const option of selectedOptions) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/template/vendor_message_template`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: option.value,
              customerMessage: customerMessage,
              ticket_number: ticket.ticket_number,
              asked_details: {
                epi: decodedMessages.epi || "Null",
                ppi: decodedMessages.ppi || "Null",
                unit: decodedMessages.unit || "Null",
                weave: decodedMessages.weave || "Null",
                width1: decodedMessages.width1 || "Null",
                width2: decodedMessages.width2 || "Null",
                width3: decodedMessages.width3 || "Null",
                content: decodedMessages.content || "Null",
                special: decodedMessages.special || "Null",
                quantity: decodedMessages.quantity || "Null",
                approvals: decodedMessages.approvals || "Null",
                warp_type: decodedMessages.warp_type || "Null",
                weft_type: decodedMessages.weft_type || "Null",
                other_info: decodedMessages.other_info || "Null",
                warp_count: decodedMessages.warp_count || "Null",
                weave_type: decodedMessages.weave_type || "Null",
                weft_count: decodedMessages.weft_count || "Null",
                fabric_type: decodedMessages.fabric_type || "Null",
                construction: decodedMessages.construction || "Null",
                warp_content: decodedMessages.warp_content || "Null",
                weft_content: decodedMessages.weft_content || "Null",
                certifications: decodedMessages.certifications || "Null",
                additional_info: decodedMessages.additional_info || "Null",
                content_percentage:
                  decodedMessages.content_percentage || "Null",
              },
              asked_details_required: false,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats
        let vendorMessage;
        if (data[option.value]?.message) {
          // New format with nested vendor object
          vendorMessage = data[option.value].message;
        } else if (typeof data === "string") {
          // Handle case where API returns direct string
          vendorMessage = data;
        } else if (data.message) {
          // Handle case where message is directly in response
          vendorMessage = data.message;
        } else {
          throw new Error("Invalid response format: message not found");
        }

        // Store the message for this vendor
        messages[option.value] = vendorMessage;

        // Log success for debugging
        console.log(
          `Successfully generated message for ${option.value}:`,
          vendorMessage
        );
      } catch (error) {
        console.error(
          `Error generating message for vendor ${option.value}:`,
          error
        );
        messages[option.value] = "Error generating message. Please try again.";
        toast.error(`Failed to generate message for ${option.value}`);
      }
    }
    setVendorMessages(messages);
  };

  const handleVendorChange = async (
    selected: MultiValue<MultiSelectOption>
  ) => {
    console.log("Selected vendors:.....", selected);
    setSelectedOptions(selected as MultiSelectOption[]);

    // Handle group update for single vendor selection
    if (selected.length === 1) {
      const vendor = selected[0];
      const fetchedVendor = await fetchVendorDetailsById(vendor.id as string);

      if (fetchedVendor?.whatsapp_groups?.length) {
        setVendorGroupOptions(fetchedVendor.whatsapp_groups);
      } else {
        setVendorGroupOptions([]);
      }
    } else {
      // If multiple vendors are selected, you may decide to clear or aggregate groups
      setVendorGroupOptions([]);
    }
  };

  useEffect(() => {
    const loadGroupsFromSelectedVendors = async () => {
      const groupSet = new Map<string, string>();

      for (const option of selectedOptions) {
        const vendor = await fetchVendorDetailsById(option.id as string);
        vendor?.whatsapp_groups?.forEach((group: any) => {
          groupSet.set(group.id, group.name);
        });
      }

      setVendorGroupOptions(
        Array.from(groupSet.entries()).map(([id, name]) => ({ id, name }))
      );
    };

    if (selectedOptions.length > 0) {
      loadGroupsFromSelectedVendors();
    }
  }, [selectedOptions]);

  const handleVendorSearch = (inputValue: string) => {
    if (inputValue.length >= 3) {
      // Only search if at least 3 characters are entered
      fetchVendors(inputValue);
    }
  };

  const handleSave = async () => {
    const updatedVendors = selectedOptions.map((option) => option.value);
    await handleUpdate(updatedVendors);
  };

  const currentStepData = ticket.steps[ticket.current_step]?.latest;
  console.log(
    "Current step data:",
    currentStepData ? JSON.stringify(currentStepData) : "No data available"
  );

  const handleSendMessage = async () => {
    const previousSelection = [...selectedOptions]; // Preserve selection
    setIsWhatsAppSending(true);
    toast.loading("Sending WhatsApp messages...");

    const results: VendorResult[] = [];

    try {
      for (const option of selectedOptions) {
        try {
          const vendor = vendorDetails.find(
            (v: Vendor) => v.id === option.id || v.name === option.value
          );

          if (!vendor) {
            console.error(`Vendor not found for ${option.value}`);
            continue;
          }

          if (!vendor.phone) {
            console.warn(`Missing phone number for vendor ${vendor.name}`);
            results.push({
              vendor_id: vendor.id,
              name: vendor.name,
              message_temp: vendorMessages[option.value] || "",
              message_sent: { email: false, whatsapp: false },
            });
            continue;
          }

          let formattedPhone = vendor.phone
            .replace(/\s+/g, "")
            .replace(/^\+/, "");
          if (!formattedPhone.startsWith("91")) {
            formattedPhone = "91" + formattedPhone;
          }
          formattedPhone = formattedPhone + "@c.us";

          const messageContent = (
            ticket.steps["Step 3 : Message Template for vendors"]?.latest
              ?.vendor_message_temp || ""
          ).replace("{VENDOR}", option.value);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/send-message`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: formattedPhone,
                content: messageContent,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || data.error || data.status === "failed") {
            throw new Error(data.error || data.message || "Unknown error");
          }

          const success = data.status === "success" || data.success === true;

          results.push({
            vendor_id: vendor.id,
            name: vendor.name,
            message_temp: vendorMessages[option.value] || "",
            message_sent: success,
          });
        } catch (innerErr) {
          console.error(`❌ Failed for ${option.value}:`, innerErr);
          const fallbackVendor = vendorDetails.find(
            (v) => v.id === option.id || v.name === option.value
          );
          results.push({
            vendor_id: fallbackVendor?.id || "",
            name: fallbackVendor?.name || option.value,
            message_temp: vendorMessages[option.value] || "",
            message_sent: { email: false, whatsapp: false },
          });
        }
      }

      await updateTicketWithSentStatus(results);
      await fetchTicket(ticket.id);
      setSelectedOptions(previousSelection); // Restore selection

      const successCount = results.filter(
        (r) => r.message_sent === true
      ).length;
      const failedCount = results.length - successCount;

      toast.dismiss();

      if (failedCount === 0) {
        toast.success("✅ WhatsApp messages sent successfully!");
      } else if (successCount > 0) {
        toast(`⚠️ ${successCount} sent, ${failedCount} failed`, {
          icon: "⚠️",
          style: {
            background: "#fff7e6",
            color: "#805200",
          },
        });
      } else {
        toast.error("❌ Failed to send WhatsApp messages.");
      }
    } catch (error) {
      console.error("Unexpected error in sending WhatsApp:", error);
      toast.dismiss();
      toast.error("Unexpected error sending WhatsApp messages.");
    } finally {
      setIsWhatsAppSending(false);
    }
  };

  interface VendorResult {
    vendor_id: string;
    name: string;
    message_temp: string;
    message_sent: boolean | { email: boolean; whatsapp: boolean }; // Changed from object to boolean
  }

  const updateTicketWithSentStatus = async (results: VendorResult[]) => {
    try {
      const vendorsObject: Record<string, any> = {};

      results.forEach((vendor) => {
        if (!vendor.vendor_id) return;

        vendorsObject[vendor.vendor_id] = {
          name: vendor.name,
          vendor_id: vendor.vendor_id,
          message_temp: vendor.message_temp || "",
          message_sent: {
            email:
              typeof vendor.message_sent === "object"
                ? vendor.message_sent.email
                : false,
            whatsapp:
              typeof vendor.message_sent === "object"
                ? vendor.message_sent.whatsapp
                : vendor.message_sent,
          },
        };
      });

      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: vendorsObject },
          }),
        }
      );

      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleSendEmail = async () => {
    const previousSelection = [...selectedOptions]; // Preserve selection
    setIsEmailSending(true);
    toast.loading("Sending emails...");

    const results: VendorResult[] = [];

    try {
      for (const option of selectedOptions) {
        const vendor = vendorDetails.find(
          (v: Vendor) => v.name === option.value
        );

        if (!vendor || !vendor.email) {
          console.warn(`⚠️ Skipping ${option.value}: Missing vendor or email`);
          results.push({
            vendor_id: vendor?.id || "",
            name: vendor?.name || option.value,
            message_temp: "",
            message_sent: { whatsapp: false, email: false },
          });
          continue;
        }

        const messageContent = (
          ticket.steps["Step 3 : Message Template for vendors"]?.latest
            ?.vendor_message_temp || ""
        ).replace("{VENDOR}", option.value);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/email/send-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: vendor.email,
                subject: "Vendor Message Template",
                html: `<p>${messageContent.replace(/\n/g, "<br>")}</p>`,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Email failed to ${vendor.name}`);
          }

          results.push({
            vendor_id: vendor.id,
            name: vendor.name,
            message_temp: messageContent,
            message_sent: {
              whatsapp: false,
              email: true,
            },
          });
        } catch (emailError) {
          console.error(`❌ Email failed for ${vendor.name}:`, emailError);
          results.push({
            vendor_id: vendor.id,
            name: vendor.name,
            message_temp: messageContent,
            message_sent: {
              whatsapp: false,
              email: false,
            },
          });
        }
      }

      await updateTicketWithSentStatusEmail(results);
      await fetchTicket(ticket.id);
      setSelectedOptions(previousSelection); // Restore selection

      const successCount = results.filter((r) => {
        if (typeof r.message_sent === "object") {
          return r.message_sent.email === true;
        }
        return false;
      }).length;

      const failedCount = results.length - successCount;

      toast.dismiss();
      if (failedCount === 0) {
        toast.success("✅ All emails sent successfully!");
      } else if (successCount > 0) {
        toast(`⚠️ ${successCount} sent, ${failedCount} failed`, {
          icon: "⚠️",
          style: {
            background: "#fff7e6",
            color: "#805200",
          },
        });
      } else {
        toast.error("❌ Failed to send all emails.");
      }

      return results;
    } catch (error) {
      console.error("Unexpected email error:", error);
      toast.dismiss();
      toast.error("Something went wrong while sending emails.");
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleSendEmailPopUp = () => {
    setShowEmailPopup(true);
  };
  const handleWhatsAppPopUp = () => {
    setShowWhatsappPopup(true);
  };

  const handleEmailPopupConfirm = async () => {
    setShowEmailPopup(false); // Close the confirmation dialog
    await handleSendEmail(); // Send emails and update the ticket status
  };

  const updateTicketWithSentStatusEmail = async (results: VendorResult[]) => {
    try {
      const vendorsObject: Record<string, any> = {};

      results.forEach((vendor) => {
        if (!vendor.vendor_id) return;

        vendorsObject[vendor.vendor_id] = {
          name: vendor.name,
          vendor_id: vendor.vendor_id,
          message_temp: vendor.message_temp || "",
          message_sent: {
            whatsapp:
              typeof vendor.message_sent === "object"
                ? vendor.message_sent.whatsapp
                : false,
            email:
              typeof vendor.message_sent === "object"
                ? vendor.message_sent.email
                : vendor.message_sent,
          },
        };
      });

      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: vendorsObject },
          }),
        }
      );

      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating ticket status for email:", error);
    }
  };

  const handleNextStep = async () => {
    try {
      // First, update current step (Step 4)
      const step4VendorsObj = selectedOptions.reduce((acc, option) => {
        const vendor = vendorDetails.find(
          (v: Vendor) => v.name === option.value
        );
        if (!vendor) {
          console.error(`Vendor not found for ${option.value}`);
          return acc;
        }
        const existingVendorData =
          ticket.steps[ticket.current_step]?.latest?.vendors?.[vendor.id] || {};

        acc[vendor.id] = {
          vendor_id: vendor.id,
          name: option.value,
          message_temp: vendorMessages[option.value] || "",
          message_sent: existingVendorData.message_sent || false,
        };
        return acc;
      }, {} as Record<string, any>);

      console.log("Step 4 vendors object:", step4VendorsObj);
      console.log(ticket.current_step);
      // Update Step 4 with object format
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: step4VendorsObj },
            step_number: ticket.current_step,
          }),
        }
      );

      // Initialize Step 5 vendors with empty responses (as array for Step 5)
      const step5VendorsArray = selectedOptions
        .map((option) => {
          const vendor = vendorDetails.find((v) => v.name === option.value);
          if (!vendor) {
            console.error(`Vendor not found for ${option.value}`);
            return null;
          }
          return {
            vendor_id: vendor.id,
            name: option.value,
            response_received: false,
            response_message: "",
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      console.log("Step 5 vendors array:", step5VendorsArray);

      // Update next step (Step 5) with array format
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_next_step?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: step5VendorsArray },
            step_number: ticket.current_step,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update next step: ${response.status}`);
      }

      await fetchTicket(ticket.id);
      setLoading(false);
      setActiveStep("Step 5 : Messages from Vendors");
      toast.success("Step 4 completed");
    } catch (error) {
      console.error("Error updating steps:", error);
      toast.error("Failed to proceed to next step");
      setLoading(false);
    }
  };

  const handlePopupConfirm = async () => {
    setShowWhatsappPopup(false); // Close the confirmation dialog
    await handleSendMessage(); // Call the function to send messages
  };

  useEffect(() => {
    // Get the saved vendor data from the ticket
    const vendorsLatest = ticket.steps[ticket.current_step]?.latest || {};
    // Check if any selected vendor has whatsapp set to true
    const anyWhatsappSent = selectedOptions.some((option) => {
      const vendorData = vendorsLatest[option.id as string];
      return (
        vendorData &&
        vendorData.message_sent &&
        vendorData.message_sent.whatsapp === true
      );
    });
    setShowResendWhatsappMessage(anyWhatsappSent);
  }, [ticket, selectedOptions]);

  console.log("Vendor Messages:", vendorMessages);

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
          <div className="py-1 mb-4">
            <h1 className="text-xl font-bold ">Customer Message</h1>
            <div>
              {ticket.steps["Step 1 : Customer Message Received"]?.latest
                ?.text || "No customer message available"}
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Step 4: Select Vendors</h3>
            {isCurrentStep && (
              <select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                {allVersions.map(({ version, time }) => (
                  <option key={version} value={version}>
                    {version === "latest" ? "Latest Version" : formatTime(time)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <MultiSelect
            options={vendors}
            value={selectedOptions}
            onChange={handleVendorChange}
            onInputChange={handleVendorSearch}
          />
          {selectedOptions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Vendor Messages</h4>
              {selectedOptions.map((option) => {
                const vendor = vendorDetails.find(
                  (v) => v.name === option.value
                );

                return (
                  <div key={option.value} className="mb-4">
                    <label>{option.value}</label>

                    <textarea
                      value={(
                        ticket.steps["Step 3 : Message Template for vendors"]
                          ?.latest?.vendor_message_temp || ""
                      ).replace("{VENDOR}", option.value)}
                      onChange={(e) =>
                        handleVendorMessageChange(option.value, e.target.value)
                      }
                      className="w-full h-32 p-2 border rounded mt-2"
                      placeholder="Enter message for vendor"
                    />

                    {emailSendingStatus[option.value] && (
                      <p
                        className={`mt-1 ${
                          emailSendingStatus[option.value] === "Email Sent"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        Status: {emailSendingStatus[option.value]}
                      </p>
                    )}
                    {whatsappSendingStatus[option.value] && (
                      <p
                        className={`mt-1 ${
                          whatsappSendingStatus[option.value] ===
                          "Whatsapp Message Sent"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        Status: {whatsappSendingStatus[option.value]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between mt-4">
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button
                onClick={handleSave}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={!isCurrentStep || selectedOptions.length === 0}
              >
                Save
              </Button>

              <Button
                onClick={handleWhatsAppPopUp}
                className={`w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 ${
                  (!isCurrentStep ||
                    selectedOptions.length === 0 ||
                    isWhatsAppSending) &&
                  "opacity-50 cursor-not-allowed"
                }`}
                disabled={
                  !isCurrentStep ||
                  selectedOptions.length === 0 ||
                  isWhatsAppSending
                }
              >
                <span>
                  {isWhatsAppSending
                    ? "Sending..."
                    : showResendWhatsappMessage
                    ? "Resend"
                    : "Send"}
                </span>
                <FaWhatsapp />
              </Button>

              {selectedOptions.length > 0 && vendorGroupOptions.length > 0 && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Group
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a group...</option>
                    {vendorGroupOptions.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                onClick={sendVendorGroupMessage}
                className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 ${
                  (!isCurrentStep || selectedGroup === "") &&
                  "opacity-50 cursor-not-allowed"
                }`}
                disabled={!isCurrentStep || selectedGroup === ""}
              >
                <FaWhatsapp />
                Send Group
              </Button>

              <Button
                onClick={handleSendEmailPopUp}
                className={`w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 ${
                  (!isCurrentStep ||
                    selectedOptions.length === 0 ||
                    isEmailSending) &&
                  "opacity-50 cursor-not-allowed"
                }`}
                disabled={
                  !isCurrentStep ||
                  selectedOptions.length === 0 ||
                  isEmailSending
                }
              >
                <span>
                  {isEmailSending
                    ? "Sending..."
                    : showResendEmail
                    ? "Resend"
                    : "Send"}
                </span>
                <MdEmail />
              </Button>

              <Button
                onClick={() =>
                  handleNext(selectedOptions.map((option) => option.value))
                }
                className={`w-full font-bold py-2 px-4 rounded ${
                  isCurrentStep
                    ? "bg-blue-500 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isCurrentStep || selectedOptions.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      {loading && <h1>Loading...</h1>}

      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending Messages...</h2>
            {!showResendWhatsappMessage && (
              <p className="mb-4">
                Are you sure you want to send messages to the selected vendors?
              </p>
            )}
            {showResendWhatsappMessage && (
              <p>
                Messages have already been sent. Do you want to resend them?
              </p>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setShowWhatsappPopup(false)}
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePopupConfirm}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {!showResendWhatsappMessage ? "OK" : "Resend"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending Emails...</h2>
            {!showResendEmail && (
              <p className="mb-4">
                Are you sure you want to send emails to the selected vendors?
              </p>
            )}
            {showResendEmail && (
              <p>Emails have already been sent. Do you want to resend them?</p>
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowEmailPopup(false)}
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEmailPopupConfirm}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {!showResendEmail ? "OK" : "Resend"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showReminderPopUp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Unsent Messages</h2>
            <p className="mb-4">
              {(() => {
                const unsentTypes = [];
                if (!isMessageSent.emailSent) unsentTypes.push("Email");
                if (!isMessageSent.whatsappMessageSent)
                  unsentTypes.push("WhatsApp");

                if (unsentTypes.length === 0) return null;

                const messageType =
                  unsentTypes.length === 1 ? "message" : "messages";
                const unsentMessage = unsentTypes.join(" and ");

                return `You haven't sent ${unsentMessage} ${messageType} to the selected vendors. Would you like to proceed without sending?`;
              })()}
            </p>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowReminderPopUp(false)}
                className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setShowReminderPopUp(false);
                  await handleNextStep();
                }}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Proceed without sending
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* {!isCurrentStep && (
        <h1 className="text-end text-yellow-500">Messages Already Sent!</h1>
      )} */}
    </div>
  );
};

export default Step4;
