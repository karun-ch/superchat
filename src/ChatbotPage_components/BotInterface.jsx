import { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { PiPaperclipBold } from "react-icons/pi";
import { BsChatText } from "react-icons/bs";
import { GrDocumentCsv } from "react-icons/gr";
import { GrDocumentPdf } from "react-icons/gr";
import {
  FaMicrophone,
  FaRedoAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import superchatLogo from "../assets/superchat_logo.png";
import Chatbot_Message from "./Chatbot_message";
import { ask_csv, ask_pdf, Chat_api, pdf_upload_api } from "../Utils/Apis";
import { Capabilities, questionSets } from "../Utils/constants";
import { logout } from "../ReduxStateManagement/authslice";
import superchatLogo_white from "../assets/superchat_logo_white.png"
import RenderLogo from "./BotInterface_components/RenderLogo";
import { changeVoiceMode } from "../ReduxStateManagement/user";
///import useSubscribed from "../customHooks/useSubscribed";



const BotInterface = () => {
  // Hooks and State
  //useSubscribed()
  const navigate = useNavigate();
  const dispatch=useDispatch()
  const { darkmode, sidebarReduced } = useSelector((store) => store.user);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [activeToggle, setActiveToggle] = useState("chat");
  const [chatStarted, setChatStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [selectedSet, setSelectedSet] = useState(() => {
    // Initialize with a random set during the first render
    const randomIndex = Math.floor(Math.random() * questionSets.length);
    return questionSets[randomIndex];
  });

  
  
  // Authentication Check
  if (!localStorage.getItem("token")) {
    navigate("/signup");
  }
   // Utility Functions
   const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("messages")) || [];
    setMessages(savedMessages);
    setChatStarted(savedMessages.length > 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

const handlevoice=()=>{
  console.log('hi')
  dispatch(changeVoiceMode(true))
}

  // Chat Handlers
  const handleChat = async (userMessage) => {
    if (!userMessage.trim()) return;

    const endpoint=activeToggle==="chat"?Chat_api: activeToggle==="pdf"?ask_pdf: ask_csv

    try {
      setMessages((prev) => [
        ...prev,
        { type: "user", content: userMessage },
        { type: "bot", content: "", isLoading: true },
      ]);
      setIsLoading(true);
      localStorage.setItem('RegenerateMessage','')
      localStorage.setItem('Error',false)
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
         // "Set-Cookie":

        },
        body: JSON.stringify({ user_input: userMessage,response_length:"medium" }),
      });
console.log(response)
     

  const data = await response.json();
  console.log(data)
if (data.message)
{
  dispatch(logout());
  localStorage.removeItem("messages")

  navigate("/signup");
}
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, content: data.response, isLoading: false }
            : msg
        )
      );
      setChatStarted(true);
      setMessage('')
      
      
    } catch (error) {
      //console.error("Chat error:", error);
     // console.log(error)
      localStorage.setItem('RegenerateMessage',userMessage)
    localStorage.setItem('Error',true)
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === prev.length - 1
          ? {  isLoading: false }
          : msg
      )
    );
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: "Error sending message. Please try again.",
        },
      ]);
      setChatStarted(true);
      setIsLoading(false);

    } finally {
      setIsLoading(false);
    }
  };



  // File Handling
  const handleFile = (fileType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        fileType === "image" ? "image/*" : fileType === "pdf" ? ".pdf" : ".csv";
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event) => {
    setMessage('')
    localStorage.setItem('RegenerateMessage','')
    localStorage.setItem('Error',false)
    const file = event.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
  
    // Debug log the file details
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size
    });
  
    const token = localStorage.getItem("token");
    const formData = new FormData();
  
    // Changed from 'file' to 'files' to match the Postman configuration
    formData.append('files', file);
  
    // Debug log the FormData contents
    // console.log("FormData contents:");
    // for (let [key, value] of formData.entries()) {
    //   console.log(key, value instanceof File ? File: ${value.name} : value);
    // }
  
    try {
      setMessages((prev) => [
        ...prev,
        { type: "user", content: `Uploading ${file.name}...` },
        { type: "bot", content: "", isLoading: true },
      ]);
      setIsLoading(true);
  
      const uploadResponse = await fetch(pdf_upload_api, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          // Removing Content-Type header to let browser set it automatically for form-data
        },
        body: formData,
      });
  
      // Log response status
      //console.log("Upload response status:", uploadResponse.status);
      
      const data = await uploadResponse.json();
      if (data.message)
        {
          dispatch(logout());
          localStorage.removeItem("messages")
        
          navigate("/signup");
        }
      
      if (!uploadResponse.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { 
                ...msg, 
                content: data.response || `Successfully uploaded ${file.name}`, 
                isLoading: false 
              }
            : msg
        ) 
      );
      setChatStarted(true);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error("File upload error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -2), // Remove the loading messages
        {
          type: "system",
          content: `Error uploading file: ${error.message}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setShowFileMenu(false);
    }
  };

  // UI Components
  
  const renderFileMenu = () => (
    <div
      className={`absolute left-0 bottom-full mb-2 w-40 rounded-md shadow-md ${
        darkmode ? "bg-[#3A3A3A] text-gray-300" : "bg-gray-100 text-black"
      }`}
    >
      {[
        { type: "pdf", icon: GrDocumentPdf, label: "PDF" },
        { type: "csv", icon: GrDocumentCsv, label: "CSV" },
      ].map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          disabled={activeToggle !== type}
          className={`p-2 text-left w-full ${
            activeToggle === type
              ? darkmode
                ? "text-white hover:bg-[#4A4A4A]"
                : "text-black hover:bg-gray-300"
              : darkmode
              ? "text-gray-500 hover:bg-[#2C2C2C]"
              : "text-gray-400 hover:bg-gray-200"
          }`}
          onClick={() => handleFile(type)}
        >
          <Icon className="inline mr-2" />
          {label}
        </button>
      ))}
    </div>
  );


  const renderInputArea = () => (
    // <div className="fixed bottom-1.5 w-full max-w-4xl mr-28">
    <div className="fixed bottom-1.5 w-full pr-6 pl-1 lg:max-w-4xl md:max-w-3xl sm:max-w-2xl xs:max-w-fit md:mr-20 ">
      <div className="flex items-center gap-0">
        {/* Responsive dropdown for small devices */}
        <div className="sm:hidden relative">
          <button 
            className={`p-2  ${
              darkmode 
                ? "bg-[#3A3A3A] text-white hover:bg-[#4A4A4A]" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setShowTypeMenu(!showTypeMenu)}
          >
            {activeToggle === "csv" ? (
              <GrDocumentCsv className="w-5 h-5 " />
            ) : activeToggle === "pdf" ? (
              <GrDocumentPdf className="w-5 h-5 " />
            ) : (
              <BsChatText className="w-5 h-5 " />
            )}
          </button>
          
          {showTypeMenu && (
            <div 
              className={`absolute bottom-full mb-2 rounded-lg shadow-lg p-2 ${
                darkmode 
                  ? "bg-[#3A3A3A] text-white" 
                  : "bg-white text-gray-800"
              }`}
            >
              {[
                { type: "csv", icon: GrDocumentCsv, label: "CSV File" },
                { type: "pdf", icon: GrDocumentPdf, label: "PDF" },
                { type: "chat", icon: BsChatText, label: "Chat" }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    setActiveToggle(type);
                    setShowTypeMenu(false);
                  }}
                  className={`flex items-center w-full p-2 rounded-md mb-1 ${
                    activeToggle === type 
                      ? (darkmode 
                        ? "bg-[#4A4A4A] text-white" 
                        : "bg-gray-300 text-black")
                      : (darkmode 
                        ? "hover:bg-[#4A4A4A] text-gray-400" 
                        : "hover:bg-gray-100 text-gray-700")
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2 " />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
  
        {/* Existing toggle for sm and above */}
        <div className="hidden sm:flex rounded-lg shadow-sm p-1 mx-5 gap-1 bg-white border-2 dark:bg-[#3A3A3A] m-4">
          {[
            { type: "csv", icon: GrDocumentCsv},
            { type: "pdf", icon: GrDocumentPdf },
            { type: "chat", icon: BsChatText },
          ].map(({ type, icon: Icon }) => (
            <button 
              key={type} 
              onClick={() => setActiveToggle(type)}
              className={`p-2 rounded-md ${
                activeToggle === type
                  ? "bg-white text-black shadow-sm dark:bg-[#4A4A4A] dark:text-white"
                  : "hover:bg-gray-300 text-gray-700 dark:hover:bg-[#3A3A3A] dark:text-gray-400"
              }`}
            >
              <Icon className="w-5 h-5 " />
            </button>
          ))}
        </div>
  
        {/* File attachment button */}
        <div className="flex items-center relative w-full">
  <button 
    className={`absolute left-2 p-2 ${
      darkmode 
        ? "text-black hover:bg-[#3A3A3A] rounded-full" 
        : "text-gray-600 hover:bg-gray-100 rounded-full"
    } focus:outline-none`} 
    onClick={() => setShowFileMenu(!showFileMenu)}
  >
    <PiPaperclipBold className="w-5 h-5 ml-2 text-gray " />
  </button>
  {showFileMenu && renderFileMenu()}
  

  {/* Input area */}
  <input 
    type="text"
    value={message}
    placeholder={
      activeToggle === "chat" 
        ? "Type your message here..." 
        : activeToggle === "pdf" 
        ? "Type questions regarding uploaded pdf..." 
        : "Type questions regarding uploaded CSV file..."
    }
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleChat(message)}
    className={`w-[800px] py-2 pl-10 pr-12 focus:outline-none rounded-lg shadow-md ${
      darkmode 
        ? "bg-white text-black" 
        : "bg-gray-100 text-black"
    } placeholder:text-xs
        sm:placeholder:text-base
        md:placeholder:text-base
        lg:placeholder:text-base`}
    style={{
      margin: '20px', // Adjust margins as needed
    }}
  />

{/* Microphone button */}
<button 
    className={`absolute right-12 p-3 rounded-full ${
      darkmode
        ? " text-black"
        : "bg-gray-100 text-gray-700"
    }`} 
    onClick={(event) => handlevoice(event)}
    aria-label="Toggle Voice Interface"
  >
    <FaMicrophone />
  </button> 
  
  {/* {isVoiceInterfaceVisible && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
                    <VoiceInterface />
                </div>
            )} */}

  {/* Send button */}
  <button 
    className={`absolute right-6 p-2 rounded-full ${
      darkmode
        ? " text-black"
        : "bg-gray-100 hover:bg-gray-300 text-gray-700"
    }`} 
    onClick={() => handleChat(message)}
  >
    <IoSend />
  </button>
</div>
          {/* no need  */}
          {/* <FaPaperPlane /> */}
        {/* </button> */}
        {/* <div>
             <button className={`p-3 rounded-full ${
              darkmode 
                ? "text-white bg-[#4A4A4A] hover:bg-[#3A3A3A] " 
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            } focus:outline-none`} 
            onClick={() => handlevoice()}
             >
               <FaMicrophone className="w-5 h-5"/>
          </button>
          </div> */}
          {/* {/* No need */}
      </div>
   </div>
  );
  // Main Render
  
  return (
    <div
  className={`pt-14 h-[800px] ${
    sidebarReduced ? "sm:ml-20" : "sm:ml-[230px]"
  } ${darkmode ? "bg-[#2C2C2C]" : "bg-white"} w-full sm:w-auto flex-1 flex flex-col items-center h-screen relative mx-auto`}
>

      {!chatStarted ? (
        isLoading ? (
          <div className="flex justify-center items-center h-full mt-4 mb-8"
          style={{ width: '100px', height: '100px' }} >
            <img
      src={darkmode ? superchatLogo_white : superchatLogo}
      alt="Superchat Logo"
              className="w-[40px] h-[40px] animate-spin"
            />
          </div>
        ) : (
          <>
            {<RenderLogo/>}
            <div className="grid grid-cols-2 gap-4 mb-20 w-auto px-20 flex-grow"
              style={{ marginTop: "180px" }} >
              <div className="hidden sm:block">
              <h3 className={`font-semibold mt-2 ${
                  darkmode ? "text-gray-300" : "text-gray-800"} text-center text-xl`}>
                  Examples
                </h3>
                {selectedSet.examples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() =>{
                      handleChat(message)
                      setMessage(example)
                    }}
                    className={`block ${
                      darkmode
                        ? "bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]"
                        : "bg-black text-white hover:bg-[#1A1A1A]"
                      } w-full py-8 pl-4 pr-7   rounded-lg shadow-md mt-3 flex justify-center items-center`}
                      style={{
                        height: "50px", // Fixed height
                        width: "250px", // Adjust to parent width
                        wordWrap: "break-word", // Wrap long text
                        textAlign: "center", // Center text
                      }}
                  >
                    {example} →
                  </button>
                ))}
              </div>

              <div className="hidden sm:block">
                <h3 className={`font-semibold mt-2 
                  ${darkmode ? "text-gray-300" : "text-gray-800"} text-center text-xl `}>
                  Capabilities
                </h3>
                {Capabilities.map((capability, idx) => (
                  <button
                    key={idx}
                    className={`block ${
                      darkmode
                        ? "bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]"
                        : "bg-black text-white hover:bg-[#1A1A1A]"
                    } w-full  py-8 pl-4 pr-7  rounded-lg shadow-md mt-3 flex justify-center items-center`}
                    style={{
                      height: "50px", // Fixed height
                      width: "250px", // Adjust to parent width
                      wordWrap: "break-word", // Wrap long text
                      textAlign: "center", // Center text
                    }}
                  >
                    {capability}
                  </button>
                ))}
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex-1 w-full overflow-y-auto p-4 mb-20">
          {messages.map((msg, index) => (
            <Chatbot_Message
              key={index}
              content={msg.content}
              type={msg.type}
              isLoading={msg.isLoading}
            />
          ))}
          <div ref={messagesEndRef} />
          {localStorage.getItem('Error')=='true' &&
          <div className="flex items-center justify-center">
              <button 
          onClick={() => handleChat(localStorage.getItem('RegenerateMessage'))}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            darkmode 
              ? "bg-[#4A4A4A] text-white hover:bg-[#5A5A5A]" 
              : "bg-slate-700 text-gray-100 hover:bg-gray-500"
          }`}
        >
          <FaRedoAlt />
          Regenerate
          
        </button>

            </div>
            }
        </div>
      )}

      {renderInputArea()}
      

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default BotInterface