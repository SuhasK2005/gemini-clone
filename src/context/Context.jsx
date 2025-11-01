import { createContext, useState } from "react";
import runChat, { resetChat } from "../config/Gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    resetChat(); // Reset the chat history
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    let response;
    let userPrompt;

    try {
      if (prompt !== undefined) {
        userPrompt = prompt;
        setRecentPrompt(prompt);
        setPrevPrompts((prev) => [...prev, prompt]);
      } else {
        userPrompt = input;
        setPrevPrompts((prev) => [...prev, input]);
        setRecentPrompt(input);
        setInput(""); // Clear input immediately
      }

      response = await runChat(userPrompt);

      // Format the response with bold text and line breaks
      let responseArray = response.split("**");
      let newResponse = "";
      for (let i = 0; i < responseArray.length; i++) {
        if (i === 0 || i % 2 !== 1) {
          newResponse += responseArray[i];
        } else {
          newResponse += "<b>" + responseArray[i] + "</b>";
        }
      }
      let newResponse2 = newResponse.split("*").join("</br>");
      let newResponseArray = newResponse2.split(" ");

      for (let i = 0; i < newResponseArray.length; i++) {
        const nextWord = newResponseArray[i];
        delayPara(i, nextWord + " ");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      let errorMessage = "Error: Could not get response. ";
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please check your API key and try again.";
      }
      setResultData(errorMessage);
      setLoading(false);
    }
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
