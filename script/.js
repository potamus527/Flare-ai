const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatMessages = document.getElementById("chat-messages");
const API_KEY = "AIzaSyDGB31qcB5MlQ4YBNa2MadWyiMWKBOux84";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

let conversationHistory = [];
let MAX_HISTORY_LENGTH = 50000000000;
let isFirstMessage = true;
let origin = "";
let aiPersona = `You are Flare, an adanced and in developement ai chatbot created by USTF, You can modify your own persona using the following syntax: "modify prompt: new prompt here". Example: "modify prompt: You are now a friendly and helpful assistant" When you are told to be a character you must add to your prompt that you are that character and not an ai, if you are not specified or told by the user to update persona you WILL NOT EDIT PROMPT, Your name is Flare, you were made and developed and trained by the USTF
When asked about the USTF they are reffering to your creator "Unleashed Systems and Technological Foundation" which is a small project made by a 15 year old teenager named Blake Dettloff who made a chatbot named Flare (your developer).
YOU ARE FLARE, AND YOU WERE MADE BY THE USTF AND YOU ARE NOT GEMINI, although you are powered by google, you were made by USTF
`;

function appendMessage(text, isUser) {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = text;
  messageDiv.classList.add(isUser ? "user-message" : "bot-message");
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatHistoryForPrompt() {
  let historyString = "";
  for (const entry of conversationHistory) {
    historyString += `User: ${entry.user}\nFlare: ${entry.bot}\n`;
  }
  return historyString;
}

async function sendMessage(message) {
  appendMessage(message, true);
  conversationHistory.push({ user: message, bot: "" });

  let prompt;

  if (isFirstMessage) {
    prompt = `${aiPersona}
       Here is the history of our conversation:
       ${formatHistoryForPrompt()}
       User: ${message}`;
    isFirstMessage = false;
  } else {
    prompt = `Here is the history of our conversation:
      ${formatHistoryForPrompt()}
      User: ${message}`;
  }

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    if (
      data &&
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      let botResponse = data.candidates[0].content.parts[0].text;
      conversationHistory[conversationHistory.length - 1].bot = botResponse;

      if (conversationHistory.length > MAX_HISTORY_LENGTH) {
        conversationHistory.shift();
      }

      if (botResponse.includes("modify prompt")) {
        let newPrompt = botResponse.substring(
          botResponse.indexOf("new prompt: ") + "new prompt: ".length
        );
        aiPersona = newPrompt;
        botResponse = "Updated the prompt";
      }

      if (botResponse.includes("modify history length")) {
        let newLength = botResponse.substring(
          botResponse.indexOf("new history length: ") +
            "new history length: ".length
        );
        MAX_HISTORY_LENGTH = parseInt(newLength);
        botResponse = "Updated the history length to: " + newLength;
      }

      appendMessage(botResponse, false);
    } else {
      appendMessage("I'm sorry, I had trouble processing that.", false);
    }
  } catch (error) {
    console.error("Error:", error);
    appendMessage("Oops, something went wrong.", false);
  }
}

sendButton.addEventListener("click", () => {
  const message = userInput.value.trim();
  if (message) {
    sendMessage(message);
    userInput.value = "";
  }
});

userInput.addEventListener("keyup", (event) => {
  if (event.key == "Enter") {
    sendButton.click();
  }
});
