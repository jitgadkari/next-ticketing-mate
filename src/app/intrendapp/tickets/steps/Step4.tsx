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
  const versions = Array.isArray(stepData.versions) ? stepData.versions : [];

  // Add latest version to the versions array for unified handling
  const allVersions = [
    {
      version: 'latest',
      time: stepData.latest?.time || 'No timestamp',
      vendors: stepData.latest?.vendors || {}
    },
    ...versions.map((v: StepVersion) => ({
      version: v.time || 'unknown',
      time: v.time || 'No timestamp',
      vendors: v.vendors || {}
    }))
  ].filter(v => v.time && typeof v.time === 'string');

  // Sort versions by time in descending order (newest first)
  allVersions.sort((a, b) => {
    if (a.time === 'No timestamp') return -1;
    if (b.time === 'No timestamp') return 1;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

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
          label: vendorData.name,
          value: vendorData.name,
          id: vendorData.vendor_id,
        }));
        console.log("selectedVendorOptions:", selectedVendorOptions);
        setSelectedOptions(selectedVendorOptions);

        // Update vendor messages
        const newMessages: Record<string, string> = {};
        (Object.entries(vendors) as Array<[string, VendorData]>).forEach(([id, vendorData]) => {
          if (vendorData.message_temp) {
            newMessages[vendorData.name] = vendorData.message_temp;
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
      label: vendor.name,
      value: vendor.name,
      id: vendor.vendor_id,
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
      console.log("Vendor found:", vendor);
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
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
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
      // setActiveStep("Step 5 : Messages from Vendors");
      // toast.success("Step 4 completed");
    } catch (error) {
      console.error("Error updating steps:", error);
    }
  };

  const handleUpdate = async (updatedVendors: string[]) => {
    console.log("Updating Step 4 vendors:", updatedVendors);
  
    // Convert vendors array to object with vendor_id as keys
    const vendorsObject = updatedVendors.reduce((acc, vendorName) => {
      const vendor = vendorDetails.find((v) => v.name === vendorName);
      if (!vendor || !vendor.id) {
        console.error(`Vendor ID not found for ${vendorName}`);
        return acc;
      }
  
      // Get existing message sent status if available
      const existingVendorData = ticket.steps[ticket.current_step]?.latest?.vendors?.[vendor.id] || {};
  
      acc[vendor.id] = {
        vendor_id: vendor.id,
        name: vendorName, // Make sure the name is correctly set
        message_temp: vendorMessages[vendorName] || "",
        message_sent: existingVendorData.message_sent || false
      };
      return acc;
    }, {} as Record<string, any>);
  
    console.log("Mapped vendors for save:", vendorsObject);
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: {
              vendors: vendorsObject
            },
            step_number: ticket.current_step
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
          newMessages[vendor.name] = vendor.message_temp;
        }
        return {
          label: vendor.name,
          value: vendor.name,
          id: vendor.vendor_id,
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
        const vendorData = vendors[option.id];
        if (vendorData?.message_temp) {
          newMessages[vendorData.name] = vendorData.message_temp;
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
    if (selectedOptions.length > 0) {
      console.log("Selected options:", selectedOptions);
      generateVendorMessages();
    }
  }, [selectedOptions]);

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
    console.log("Fetching all vendors...");
    try {
      // Commented filtered vendors code for future reference
      /*
      const decoded_messages = ticket.steps["Step 2 : Message Decoded"].latest.decoded_messages;
      const cleanDecodedMessages = Object.entries(decoded_messages).reduce((acc, [key, value]) => {
        if (value && value !== "Null" && value !== "null") {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const filters_dict = {
        // ... filters dictionary construction
      };
      */

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors?limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const vendorsData = await response.json();
      console.log("Fetched vendors:", vendorsData);

      // Handle both array and object response formats
      const vendorData = Array.isArray(vendorsData.vendors) ? vendorsData.vendors : Object.values(vendorsData.vendors || {});
      console.log("Vendor data from API:", vendorData);
      
      // Map vendors ensuring all required fields
      const vendorsList = vendorData
        .filter((v: any) => v && (v.id || v.vendor_id)) // Ensure we have an ID
        .map((v: any): Vendor => {
          // Get the correct ID and name fields
          const vendorId = v.vendor_id || v.id;
          const vendorName = v.name || (ticket.steps[ticket.current_step]?.latest?.vendors?.[vendorId]?.name) || 'Unnamed Vendor';
          
          return {
            id: vendorId,
            name: vendorName,
            group: v.group || "",
            email: v.email || "",
            phone: v.phone || ""
          };
        });

      console.log("Mapped vendors list:", vendorsList);
      
      if (vendorsList.length > 0) {
        console.log("Setting vendors in dropdown...");
        // Use existing vendor data from ticket if available
        const vendorOptions = vendorsList.map((vendor: Vendor) => {
          // Check if we have existing data for this vendor in the ticket
          const existingVendor = ticket.steps[ticket.current_step]?.latest?.vendors?.[vendor.id];
          const option = {
            label: existingVendor?.name || vendor.name,
            value: existingVendor?.name || vendor.name,
            id: vendor.id,
          };
          console.log("Created vendor option:", option);
          return option;
        });
        
        console.log("Final vendor options:", vendorOptions);
        setVendors(vendorOptions);
        setVendorDetails(vendorsList);
      } else {
        console.log("No valid vendors found");
        toast.error("No valid vendors available");
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
    const customerMessage = ticket.steps["Step 1 : Customer Message Received"]?.latest?.text;
    const decodedMessages = ticket.steps["Step 2 : Message Decoded"]?.latest?.decoded_messages || {};
    
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
              vendor_name: option.value,
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
                content_percentage: decodedMessages.content_percentage || "Null"
              },
              asked_details_required: false
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
        } else if (typeof data === 'string') {
          // Handle case where API returns direct string
          vendorMessage = data;
        } else if (data.message) {
          // Handle case where message is directly in response
          vendorMessage = data.message;
        } else {
          throw new Error('Invalid response format: message not found');
        }

        // Store the message for this vendor
        messages[option.value] = vendorMessage;
        
        // Log success for debugging
        console.log(`Successfully generated message for ${option.value}:`, vendorMessage);
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

  const handleVendorChange = (selected: MultiValue<MultiSelectOption>) => {
    console.log("Selected vendors:.....", selected);
    setSelectedOptions(selected as MultiSelectOption[]);
  };

  const handleSave = async () => {
    const updatedVendors = selectedOptions.map((option) => option.value);
    await handleUpdate(updatedVendors);
  };

  const currentStepData = ticket.steps[ticket.current_step]?.latest;
  console.log('Current step data:', currentStepData ? JSON.stringify(currentStepData) : 'No data available');

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
          name: vendor.name, // Changed from vendor_name to name
          message_temp: vendorMessages[option.value] || "",
          message_sent: true // Changed to boolean
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
    name: string; // Changed from vendor_name to name
    message_temp: string;
    message_sent: boolean; // Changed from object to boolean
  }

  const updateTicketWithSentStatus = async (results: VendorResult[]) => {
    try {
      // Convert results array to object with vendor_id as keys
      const vendorsObject = results.reduce((acc, vendor) => {
        acc[vendor.vendor_id] = {
          name: vendor.name,
          vendor_id: vendor.vendor_id,
          message_temp: vendor.message_temp,
          message_sent: vendor.message_sent
        };
        return acc;
      }, {} as Record<string, any>);

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
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
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


  const handleNextStep = async () => {
    try {
      // First, update current step (Step 4)
      const step4VendorsObj = selectedOptions.reduce((acc, option) => {
        const vendor = vendorDetails.find((v: Vendor) => v.name === option.value);
        if (!vendor) {
          console.error(`Vendor not found for ${option.value}`);
          return acc;
        }
        const existingVendorData = ticket.steps[ticket.current_step]?.latest?.vendors?.[vendor.id] || {};
        
        acc[vendor.id] = {
          vendor_id: vendor.id,
          name: option.value,
          message_temp: vendorMessages[option.value] || "",
          message_sent: existingVendorData.message_sent || false
        };
        return acc;
      }, {} as Record<string, any>);

      console.log("Step 4 vendors object:", step4VendorsObj);

      // Update Step 4 with object format
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: step4VendorsObj },
            step_number: ticket.current_step
          }),
        }
      );

      // Initialize Step 5 vendors with empty responses (as array for Step 5)
      const step5VendorsArray = selectedOptions.map((option) => {
        const vendor = vendorDetails.find((v) => v.name === option.value);
        if (!vendor) {
          console.error(`Vendor not found for ${option.value}`);
          return null;
        }
        return {
          vendor_id: vendor.id,
          name: option.value,
          response_received: false,
          response_message: ""
        };
      }).filter((v): v is NonNullable<typeof v> => v !== null);

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
            step_number: "Step 5 : Messages from Vendors"
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
              {ticket.steps["Step 1 : Customer Message Received"]?.latest?.text || 'No customer message available'}
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
                    value={vendorMessages[option.value] || ''}
                    onChange={(e) => handleVendorMessageChange(option.value, e.target.value)}
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
