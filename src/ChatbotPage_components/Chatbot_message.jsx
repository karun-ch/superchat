import superchatLogo from "../assets/superchat_logo.png";
import superchatLogo_white from "../assets/superchat_logo_white.png"

import { useSelector } from "react-redux";

const Chatbot_Message = ({ content, type = "text", isLoading }) => {
  const { darkmode } = useSelector((store) => store.user);

  // Conditional styles for dark and light modes
  const messageStyles = darkmode
    ? {
        userMessage: "bg-gray-500 text-gray-200", // Blue for user messages
        botMessage: "bg-[#3A3A3A] text-gray-300", // Dark gray for bot messages
        systemMessage: "bg-[#2C2C2C] text-gray-400", // Darker gray for system messages
        iconColor: "bg-[#3A3A3A]", // Dark gray for bot icon background
      }
    : {
      userMessage: "bg-gray-500 text-gray-200", // Blue for user messages
      botMessage: "bg-gray-100 text-gray-800", // Light gray for bot messages
        systemMessage: "bg-gray-200 text-gray-600", // Lighter gray for system messages
        iconColor: "bg-gray-200", // Light gray for bot icon background
      };

  return (
    <div
      className={`flex gap-3 mb-4 ${
        type === "system" ? "justify-center" : type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {/* Icon for bot/system messages */}
      {type !== "system" && type !== "user" && (
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${messageStyles.iconColor}`}
        >
          {type === "bot" && isLoading ? (
            <img
              src={darkmode ? superchatLogo_white :superchatLogo}
              alt="Loading"
              className="w-6 h-6 animate-spin bg-transparent"
            />
          ) : (
            <img
            src={darkmode ? superchatLogo_white :superchatLogo}
            alt="Superchat Logo"
              className="w-6 h-6 bg-transparent"
            />
          )}
        </div>
      )}

      {/* Message content */}
      <div
        className={`rounded-lg p-3 max-w-[75%] ${
          type === "system"
            ? messageStyles.systemMessage
            : type === "bot"
            ? messageStyles.botMessage
            : messageStyles.userMessage
        }`}
      >
        {isLoading ? "..." : content}
      </div>
    </div>
  );
};

export default Chatbot_Message;
