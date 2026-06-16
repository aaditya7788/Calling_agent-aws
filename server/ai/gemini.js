import { GoogleGenAI } from "@google/genai";
import { generateTTS } from "./tts.js";

import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TOKEN });
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite-preview-06-17';

// Store conversations per call (keyed by callSid or sessionId)
// Each session has: { systemPrompt: string, messages: [{user, bot}] }
const conversations = new Map();

export async function gemini(prompt, sessionId = 'default', isSystemPrompt = false) {
  try {
    // Get or create conversation for this session
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, {
        systemPrompt: '',
        messages: []
      });
    }
    const session = conversations.get(sessionId);
    
    // If this is a system prompt, store it separately and generate initial response
    if (isSystemPrompt) {
      session.systemPrompt = prompt;
      console.log(`📋 System prompt set for session ${sessionId}`);
      
      // Generate initial AI response based on system prompt
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });
      
      const aiReply = response.text;
      console.log(`🤖 Initial AI Reply: ${aiReply}`);
      return aiReply;
    }
    
    // Regular user message - add to conversation log
    session.messages.push({ user: prompt });

    // Build context: system prompt + conversation history
    const conversationContext = session.messages
      .map((entry) => `User: ${entry.user}\nBot: ${entry.bot || ''}`)
      .join('\n');
    
    const fullContext = session.systemPrompt 
      ? `${session.systemPrompt}\n\n${conversationContext}\nUser: ${prompt}`
      : `${conversationContext}\nUser: ${prompt}`;

    // Generate AI response based on the full context
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: fullContext,
    });

    const aiReply = response.text;

    // Add the AI's reply to the conversation log
    session.messages[session.messages.length - 1].bot = aiReply;

    console.log(`🗣 Conversation (${sessionId}) - Messages:`, session.messages);
    return aiReply;
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Sorry, I couldn't process your request.";
  }
}

// Function to clear a conversation when call ends
export function clearConversation(sessionId) {
  conversations.delete(sessionId);
  console.log(`🧹 Cleared conversation for session: ${sessionId}`);
}

// Example usage:
// const prompt = `You are an AI assistant named Callo. Your task is to help users with their queries. Respond in a friendly and concise manner. Give short answers less than 150 characters.`;

// if (await gemini(prompt).then((response) => {
//   generateTTS(response, "speech");
//   console.log("🤖 AI Reply:", response);
//   console.log("🔊 Audio URL:", "/audio/speech.mp3");
// })) {
//   console.log("✅ Gemini function executed successfully.");
// }