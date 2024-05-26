import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import UAParser from "ua-parser-js";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const parser = new UAParser();
  const deviceInfo = parser.getResult();

  const getIpAddress = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP address:", error);
      return null;
    }
  };

  const sendMessage = async (message) => {
    const ipAddress = await getIpAddress();
    const messagePayload = {
      message,
      device: {
        deviceInfo: deviceInfo,
        ip: ipAddress,
      },
    };
    setLoading(true);
    try {
      const res = await fetch(
        `/api/messages/send/${selectedConversation._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messagePayload }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([...messages, data]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};
export default useSendMessage;
