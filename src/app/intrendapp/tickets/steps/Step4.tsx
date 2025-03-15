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
}

interface VendorData {
  vendor_name: string;
  message_temp?: string;
  message_sent?: {
    whatsapp: boolean;
    email: boolean;
  };
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
    created_data: string;
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
  interface StepVersion {
    time: string;
    vendors: Record<string, VendorData>;
  }

  const stepData = ticket.steps[ticket.current_step] || {};
  const versions = stepData.versions || [];

  // Add latest version to the versions array for unified handling
  const allVersions = [
    {
      version: 'latest',
      time: stepData.latest?.time || 'No timestamp',
      vendors: stepData.latest?.vendors || {}
    },
    ...versions.map((v: StepVersion) => ({
      version: v.time,
      time: v.time,
      vendors: v.vendors
    }))
  ];

  // Sort versions by time in descending order (newest first)
  allVersions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const [selectedVersion, setSelectedVersion] = useState<string>('latest');

  const formatTime = (timestamp: string) => {
    if (timestamp === 'No timestamp') return timestamp;
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleVersionChange = (version: string) => {
    if (isCurrentStep) {
      setSelectedVersion(version);
      const selectedVersionData = allVersions.find(v => v.version === version);
      if (selectedVersionData) {
        // Get vendor data from the selected version
        const vendors = selectedVersionData.vendors || {};

        // Update selected options
        const selectedVendorOptions = (Object.entries(vendors) as Array<[string, VendorData]>).map(([id, vendorData]) => ({
          label: vendorData.vendor_name,
          value: vendorData.vendor_name,
          id: id,
        }));
        setSelectedOptions(selectedVendorOptions);

        // Update vendor messages
        const newMessages: Record<string, string> = {};
        (Object.entries(vendors) as Array<[string, VendorData]>).forEach(([id, vendorData]) => {
          if (vendorData.message_temp) {
            newMessages[vendorData.vendor_name] = vendorData.message_temp;
          }
        });
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
    Object.entries(selectedVendors1.vendors || {}).map(([id, vendor]: [string, VendorData]) => ({
      label: vendor.vendor_name,
      value: vendor.vendor_name,
      id: id,
    }))
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

  const handleNext = async (updatedVendors: string[]) => {
    console.log("Handling next for Step 4");
    console.log("Step 4 updated vendors:", updatedVendors);
    const vendorsToUpdate = updatedVendors.map((vendorName) => {
      const vendor = vendorDetails.find((v: Vendor) => v.name === vendorName);
      return {
        vendor_id: vendor?.id,
        vendor_name: vendorName,
        message_temp: vendorMessages[vendorName] || "",
        message_sent: {
          whatsapp: false,
          email: false,
        },
      };
    });

    console.log("mapped vendors", vendorsToUpdate);
    try {
      // Save Step 4 data
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: vendorsToUpdate },
          }),
        }
      );

      // Initialize Step 5 with empty messages
      const emptyVendorMessages = Object.keys(updatedVendors).reduce(
        (acc, vendor) => {
          acc[vendor] = "";
          return acc;
        },
        {} as Record<string, string>
      );

      console.log("Step 5 initial vendor messages:", emptyVendorMessages);

      // await fetch(
      //   `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       ticket_id: ticket.id,
      //       step_info: emptyVendorMessages,
      //       step_number: ticket.current_step,
      //     }),
      //   }
      // );

      // await fetchTicket(ticket.id);
      // setLoading(false);
      // setActiveStep("Step 5: Messages from Vendors");
      // toast.success("Step 4 completed");
    } catch (error) {
      console.error("Error updating steps:", error);
    }
  };

  const handleUpdate = async (updatedVendors: string[]) => {
    console.log("Updating Step 4 vendors:", updatedVendors);
    console.log("vendor details", vendorDetails);

    // Map updatedVendors to the desired structure
    const vendorsToUpdate = updatedVendors
      .map((vendorName) => {
        const vendor = vendorDetails.find((v) => v.name === vendorName);
        // If vendor or vendor._id is not found, skip this entry or provide a fallback
        if (!vendor || !vendor.id) {
          console.error(`Vendor ID not found for ${vendorName}`);
          return null; // or return a fallback object if appropriate
        }
        return {
          vendor_id: vendor.id, // Ensured to be a string
          vendor_name: vendorName,
          message_temp: vendorMessages[vendorName] || "",
          message_sent: {
            whatsapp: false,
            email: false,
          },
        };
      })
      .filter((vendor) => vendor !== null); // remove any null entries

    console.log("mapped vendors......", vendorsToUpdate);

    try {
      // Get the current step data
      const currentStepData = ticket.steps[ticket.current_step] || {};
      const currentVersions = currentStepData.versions || [];

      // Create new version data
      const newVersion = {
        time: new Date().toISOString(),
        vendors: vendorsToUpdate.reduce((acc: Record<string, any>, vendor: any) => {
          if (vendor && vendor.vendor_id) {
            acc[vendor.vendor_id] = {
              vendor_name: vendor.vendor_name,
              message_temp: vendor.message_temp,
              message_sent: vendor.message_sent
            };
          }
          return acc;
        }, {})
      };

      // Add current version to versions array
      const updatedVersions = [newVersion, ...currentVersions];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: {
              vendors: vendorsToUpdate,
              versions: updatedVersions,
              latest: {
                time: newVersion.time,
                vendors: newVersion.vendors
              }
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }

      await fetchTicket(ticket.id);
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error updating Step 4:", error);
      toast.error("Failed to save changes");
    }
  };

  // Initialize version data and vendor messages when component mounts
  useEffect(() => {
    const currentStepData = ticket.steps[ticket.current_step] || {};
    const currentVersions = currentStepData.versions || [];
    const latestVersion = currentStepData.latest;

    if (latestVersion) {
      // Initialize with latest version's data
      const vendors = latestVersion.vendors || {};
      const newMessages: Record<string, string> = {};
      const newSelectedOptions = (Object.entries(vendors) as Array<[string, VendorData]>).map(([id, vendor]) => {
        if (vendor.message_temp) {
          newMessages[vendor.vendor_name] = vendor.message_temp;
        }
        return {
          label: vendor.vendor_name,
          value: vendor.vendor_name,
          id: id,
        };
      });

      setSelectedOptions(newSelectedOptions);
      setVendorMessages(newMessages);
      setSelectedVersion('latest');
    }
  }, [ticket.steps, ticket.current_step]);

  // Update vendor messages when selected version changes
  useEffect(() => {
    const currentStepData = ticket.steps[ticket.current_step] || {};
    const selectedVersionData = selectedVersion === 'latest'
      ? currentStepData.latest
      : (currentStepData.versions || []).find((v: StepVersion) => v.time === selectedVersion);

    if (selectedVersionData) {
      const vendors = selectedVersionData.vendors || {};
      const newMessages: Record<string, string> = {};

      // Update messages for currently selected vendors
      selectedOptions.forEach((option) => {
        if (option.id && vendors[option.id]?.message_temp) {
          newMessages[option.value] = vendors[option.id].message_temp;
        } else {
          // Keep existing message if available, otherwise empty string
          newMessages[option.value] = vendorMessages[option.value] || '';
        }
      });

      // Only update if messages have changed
      const currentMessages = JSON.stringify(vendorMessages);
      const updatedMessages = JSON.stringify(newMessages);
      if (currentMessages !== updatedMessages) {
        setVendorMessages(newMessages);
      }
    }
  }, [selectedOptions, ticket.steps, ticket.current_step, vendorMessages, selectedVersion]);

  useEffect(() => {
    fetchVendors();
  }, []);

  console.log("selectedOptions", selectedOptions);
  console.log("template", template);
  useEffect(() => {
    if (selectedOptions.length > 0 && template) {
      console.log("Selected options:", selectedOptions);
      generateVendorMessages();
    }
  }, [selectedOptions, template]);

  // const fetchCustomer=async()=>{
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer/${ticket.customer_id}`
  //     );
  //     const data = await response.json();
  //     console.log(data);
  //     return data;
  //   } catch (error) {
  //     console.error("Error fetching customer:", error);
  //   }
  // }




  const fetchVendors = async () => {
    console.log("Fetching vendors with filters...");
    try {
      const decoded_messages = ticket.steps["Step 2 : Message Decoded"].latest.decoded_messages;
      console.log("Decoded messages:", decoded_messages);

      // Construct filters dictionary from decoded messages
      // Clean and validate decoded messages
      const cleanDecodedMessages = Object.entries(decoded_messages).reduce((acc, [key, value]) => {
        // Only include non-null and non-"Null" values
        if (value && value !== "Null" && value !== "null") {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      console.log("Cleaned decoded messages:", cleanDecodedMessages);

      // Construct filters dictionary from cleaned messages
      const filters_dict: Record<string, any> = {
        epi: cleanDecodedMessages.ppi,
        ppi: cleanDecodedMessages.ppi,
        unit: cleanDecodedMessages.unit,
        weave: cleanDecodedMessages.weave,
        width1: cleanDecodedMessages.width1,
        width2: cleanDecodedMessages.width2,
        width3: cleanDecodedMessages.width3,
        content: cleanDecodedMessages.content,
        special: cleanDecodedMessages.special,
        quantity: cleanDecodedMessages.quantity,
        approvals: cleanDecodedMessages.approvals,
        warp_type: cleanDecodedMessages.warp_type,
        weft_type: cleanDecodedMessages.weft_type,
        other_info: cleanDecodedMessages.other_info,
        warp_count: cleanDecodedMessages.warp_count,
        weave_type: cleanDecodedMessages.weave_type,
        weft_count: cleanDecodedMessages.weft_count,
        fabric_type: cleanDecodedMessages.fabric_type,
        construction: cleanDecodedMessages.construction,
        warp_content: cleanDecodedMessages.warp_content,
        weft_content: cleanDecodedMessages.weft_content,
        certifications: cleanDecodedMessages.certifications,
        additional_info: cleanDecodedMessages.additional_info,
        content_percentage: cleanDecodedMessages.content_percentage
      };

      // Remove undefined values from filters_dict
      const cleanedFilters = Object.entries(filters_dict).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Prepare request payload
      const requestPayload = {
        filters_dict: cleanedFilters,
        limit: 10,
        offset: 0,
        sort_field: "created_date",
        sort_order: "desc"
      };
      console.log(requestPayload.filters_dict)
      console.log("Request payload for filtered vendors:", JSON.stringify(requestPayload, null, 2));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors/filtered`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response Data:", data);
      console.log("Raw API Response:", JSON.stringify(data, null, 2));

      // Handle the response data
      const rawVendors = Array.isArray(data) ? data : data.vendors || [];
      const vendorsList = rawVendors.map((v: any): Vendor => ({
        id: v.id,
        name: v.name,
        group: v.group,
        email: v.email,
        phone: v.phone
      }));

      if (vendorsList.length > 0) {
        console.log("Successfully fetched filtered vendors:", vendorsList);
        setVendors(
          vendorsList.map((vendor: Vendor) => ({
            label: vendor.name,
            value: vendor.name,
            id: vendor.id,
          }))
        );
        setVendorDetails(vendorsList);
      } else {
        console.error("Unexpected response format. Expected {vendors: Array}. Got:", data);
      }
    } catch (error) {
      console.error("Error fetching filtered vendors:", error);
    }
  };

  const handleVendorMessageChange = (vendorName: string, message: string) => {
    setVendorMessages(prev => {
      const newMessages = { ...prev };
      newMessages[vendorName] = message;
      return newMessages;
    });
  };

  const generateVendorMessages = async () => {
    const messages: Record<string, string> = {};
    for (const option of selectedOptions) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/replace_vendor_with_name`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message_template: template,
              vendor_name: option.value,
            }),
          }
        );
        const data = await response.json();
        messages[
          option.value
        ] = `${data}\n Ticket Number: ${ticket.ticket_number}`;
      } catch (error) {
        console.error(
          `Error generating message for vendor ${option.value}:`,
          error
        );
        messages[option.value] = "Error generating message";
      }
    }
    setVendorMessages(messages);
  };

  const handleVendorChange = (selected: MultiValue<MultiSelectOption>) => {
    console.log("Selected vendors:.....", selected);
    setSelectedOptions(selected as MultiSelectOption[]);
  };

  const handleSave = async () => {
    const updatedVendors = selectedOptions.map((option) => option.value);
    await handleUpdate(updatedVendors);
  };

  console.log(ticket.steps[ticket.current_step].latest);

  const handleSendMessage = async () => {
    setIsWhatsAppSending(true);
    try {
      toast.loading("Sending WhatsApp messages...");
      const messagePromises = selectedOptions.map(async (option) => {
        const vendor = vendorDetails.find((v: Vendor) => v.name === option.value);
        console.log(vendor)
        console.log(vendorMessages[option.value])
        if (!vendor || !vendor.phone) {
          throw new Error(`Missing vendor details or phone number for ${option.value}`);
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp_message/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: `${vendor.phone}@c.us`,
              message: vendorMessages[option.value],
            }),
          }
        );
        console.log(response);
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          throw new Error(`Failed to send WhatsApp to ${option.value}`);
        }

        // Return vendor info with updated message_sent status
        return {
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          message_temp: vendorMessages[option.value] || "",
          message_sent: {
            whatsapp: true,
            email: false, // unchanged for now
          },
        };
      });

      const results = await Promise.all(messagePromises);
      await updateTicketWithSentStatus(results);
      console.log(results)
      toast.dismiss();
      toast.success("WhatsApp messages sent successfully!");
    } catch (error) {
      console.error("Error sending WhatsApp messages:", error);
      toast.dismiss();
      toast.error("Failed to send WhatsApp messages.");
    }
  };

  interface VendorResult {
    vendor_id: string;
    vendor_name: string;
    message_temp: string;
    message_sent: {
      whatsapp: boolean;
      email: boolean;
    };
  }

  const updateTicketWithSentStatus = async (results: VendorResult[]) => {
    try {
      // Here, results already contain the updated vendor data.
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: results },
          }),
        }
      );
      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleSendEmail = async () => {
    setIsEmailSending(true);
    try {
      toast.loading("Sending emails...");
      // Assuming you send email for each selected vendor
      const emailPromises = selectedOptions.map(async (option) => {
        const vendor = vendorDetails.find((v: Vendor) => v.name === option.value);
        if (!vendor) {
          throw new Error(`Vendor not found for ${option.value}`);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vendor_name: vendor.name,
              message: vendorMessages[option.value],
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to send email to ${vendor.name}`);
        }
        // Return vendor info with updated email status
        return {
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          message_temp: vendorMessages[option.value] || "",
          message_sent: {
            whatsapp: false, // unchanged here
            email: true,
          },
        };
      });

      const results = await Promise.all(emailPromises);
      await updateTicketWithSentStatusEmail(results);
      toast.dismiss();
      toast.success("Emails sent successfully!");
      return results;
    } catch (error) {
      console.error("Error sending email:", error);
      toast.dismiss();
      toast.error("Failed to send email.");
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
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: results },
          }),
        }
      );
      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating ticket status for email:", error);
    }
  };


  // This function now builds the Step 5 payload as an array of vendor objects
  const handleNextStep = async () => {
    // Get vendor names from the selected options
    const updatedVendors = selectedOptions.map((option) => option.value);
    console.log("Next Step vendors:", updatedVendors);

    // For each vendor, use saved message status if it exists; otherwise default to false
    const vendorsToUpdate = updatedVendors.map((vendorName) => {
      const vendor = vendorDetails.find((v: Vendor) => v.name === vendorName);
      if (!vendor) {
        console.error(`Vendor not found for ${vendorName}`);
        return null;
      }
      // Look for any saved data for this vendor from Step 4 using the vendor's id as key
      const savedData = ticket.steps[ticket.current_step]?.latest[vendor.id] || {};
      return {
        vendor_id: vendor.id,
        vendor_name: vendorName,
        message_temp: vendorMessages[vendorName] || "",
        message_sent: savedData.message_sent
          ? savedData.message_sent
          : { whatsapp: false, email: false },
      };
    }).filter((v): v is NonNullable<typeof v> => v !== null);

    console.log("Mapped vendors for Step 4 update:", vendorsToUpdate);
    console.log("payload", JSON.stringify({
      ticket_id: ticket.id,
      step_number: ticket.current_step,
      step_info: { vendors: vendorsToUpdate },
    }));

    try {
      // Update Step 4 with the vendor details (including the message sent status)
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: vendorsToUpdate },
          }),
        }
      );

      // Initialize Step 5 payload as an array instead of an object
      const emptyVendorMessages = selectedOptions.map((option) => {
        const vendor = vendorDetails.find((v) => v.name === option.value);
        return {
          vendor_id: vendor?.id,
          vendor_name: vendor?.name,
          response_received: false,
          response_message: "",
          message_received_time: "", // Could also be a timestamp if needed
        };
      });

      console.log("Step 5 initial vendor messages:", emptyVendorMessages);

      // Update Step 5 with the empty messages array
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: emptyVendorMessages },
            step_number: ticket.current_step,
          }),
        }
      );
      console.log(response);

      // Optionally fetch updated ticket data and move to Step 5
      await fetchTicket(ticket.id);
      setLoading(false);
      setActiveStep("Step 5: Messages from Vendors");
      toast.success("Step 4 completed");
    } catch (error) {
      console.error("Error updating steps:", error);
    }
  };


  const handlePopupConfirm = async () => {
    setShowWhatsappPopup(false); // Close the confirmation dialog
    await handleSendMessage(); // Call the function to send messages
  };

  useEffect(() => {
    // Get the saved vendor data from the ticket
    const vendorsLatest =
      ticket.steps[ticket.current_step]?.latest || {};
    // Check if any selected vendor has whatsapp set to true
    const anyWhatsappSent = selectedOptions.some((option) => {
      const vendorData = vendorsLatest[option.id];
      return (
        vendorData &&
        vendorData.message_sent &&
        vendorData.message_sent.whatsapp === true
      );
    });
    setShowResendWhatsappMessage(anyWhatsappSent);
  }, [ticket, selectedOptions]);

  console.log("Vendor Messages:", vendorMessages);

  console.log("selected options....", selectedOptions);
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
          <div className="py-1 mb-4">
            <h1 className="text-xl font-bold ">Customer Message</h1>
            <div>
              {ticket.steps["Step 1 : Customer Message Received"].latest.text}
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Step 4: Select Vendors</h3>
            {isCurrentStep && versions.length > 0 && (
              <select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                {allVersions.map(({ version, time }) => (
                  <option key={version} value={version}>
                    {version === 'latest' ? 'Latest Version' : formatTime(time)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <MultiSelect
            options={vendors}
            value={selectedOptions}
            onChange={handleVendorChange}
          />
          {selectedOptions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Vendor Messages</h4>
              {selectedOptions.map((option) => (
                <div key={option.value} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {option.value}
                  </label>
                  <textarea
                    defaultValue={vendorMessages[option.value] || ''}
                    onBlur={(e) => handleVendorMessageChange(option.value, e.target.value)}
                    className="w-full h-32 p-2 border rounded mt-2"
                    placeholder="Enter message for vendor"
                  />
                  {/* <textarea
                    value={
                     vendorMessages[option.value]  
                    }
                    onChange={(e) =>
                      handleVendorMessageChange(option.value, e.target.value)
                    }
                    className={`w-full h-32 p-2 border rounded mt-2 `}
                  /> */}
                  {emailSendingStatus[option.value] && (
                    <p
                      className={`mt-1 ${emailSendingStatus[option.value] === "Email Sent"
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                    >
                      Status: {emailSendingStatus[option.value]}
                    </p>
                  )}
                  {whatsappSendingStatus[option.value] && (
                    <p
                      className={`mt-1 ${whatsappSendingStatus[option.value] ===
                          "Whatsapp Message Sent"
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                    >
                      Status: {whatsappSendingStatus[option.value]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!isCurrentStep}
            >
              Save
            </Button>
            <Button
              onClick={handleWhatsAppPopUp}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${(!isCurrentStep ||
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
            <Button
              onClick={handleSendEmailPopUp}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${(!isCurrentStep ||
                  selectedOptions.length === 0 ||
                  isEmailSending) &&
                "opacity-50 cursor-not-allowed "
                }`}
              disabled={
                !isCurrentStep || selectedOptions.length === 0 || isEmailSending
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
              onClick={handleNextStep}
              className={`font-bold py-2 px-4 rounded ${isCurrentStep
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              disabled={!isCurrentStep || selectedOptions.length === 0}
            >
              Next
            </Button>
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
              {`You haven't sent ${!isMessageSent.emailSent ? "Email" : ""}${!isMessageSent.emailSent && !isMessageSent.whatsappMessageSent
                  ? ", "
                  : ""
                }${!isMessageSent.whatsappMessageSent ? "WhatsApp" : ""
                } messages yet. Would you like to proceed without sending?`}
            </p>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowReminderPopUp(false)}
                className="mr-2 bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleNextStep();
                  setShowReminderPopUp(false);
                }}
                className=" bg-gray-300 hover:bg-gray-400 text-black  font-bold py-2 px-4 rounded"
              >
                Proceed without sending
              </Button>
            </div>
          </div>
        </div>
      )}
      {!isCurrentStep && (
        <h1 className="text-end text-yellow-500">Messages Already Sent!</h1>
      )}
    </div>
  );
};

export default Step4;
