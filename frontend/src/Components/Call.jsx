import React, { useState } from "react";
import { scheduleCall } from "../../api/requests";

const Call = ({ googleId }) => {
  const [form, setForm] = useState({
    googleId: googleId,
    contactName: "",
    phoneNumber: "",
    goal: "",
    personality: "",
    script: "",
    language: "",
    voice: "",
  });

  // Predefined options
  const Personalities = ["Friendly", "Professional", "Witty", "Empathetic"];
  
  // Language and Voice mapping based on AWS Polly
  const LanguageVoices = {
    "English (US)": [
      { name: "Joanna", gender: "Female" },
      { name: "Matthew", gender: "Male" },
      { name: "Ivy", gender: "Female" },
      { name: "Justin", gender: "Male" },
      { name: "Kendra", gender: "Female" },
      { name: "Kimberly", gender: "Female" },
      { name: "Salli", gender: "Female" },
      { name: "Joey", gender: "Male" },
    ],
    "English (Indian)": [
      { name: "Aditi", gender: "Female" },
      { name: "Raveena", gender: "Female" },
    ],
    "Hindi": [
      { name: "Kajal", gender: "Female" },
    ],
  };

  // Get available voices based on selected language
  const getAvailableVoices = () => {
    if (!form.language) return [];
    return LanguageVoices[form.language] || [];
  };

  // Predefined test data
  const testData = {
    contactName: "Aaditya Sahani",
    phoneNumber: "+91",
    goal: "Order Delay Notification",
    personality: "Professional",
    script: `you going to talk to Aaditya Sahani, on call to discuss Order Delay Notification in a Professional tone. from now dont need to say anything about yourself, just focus on the topic. without emojis or any other distractions. your script is: Hi! This is an update regarding your order for Freakin denim blue jeans, order ID ending in 4827. We wanted to let you know that your order will be shipped tomorrow, but there will be a delay of approximately 6 hours in the expected delivery time.

We sincerely apologize for the inconvenience this may cause. If you have any questions or need further assistance, please don’t hesitate to ask. We're here to help.

Thank you for your patience and continued support when it feels like you are done, say "thank you for your time" and end the call. dont say anything else which is outoff script and goal dodge that question.`,
    voice: "Joanna",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset voice if language changes
    if (name === "language") {
      setForm((prev) => ({ ...prev, [name]: value, voice: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAutofill = () => {
    setForm((prev) => ({ ...prev, ...testData }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.contactName || !form.phoneNumber || !form.goal || !form.personality || !form.language || !form.voice) {
      alert("Please fill in all required fields: Contact Name, Phone Number, Goal, Personality, Language, and Voice");
      return;
    }

    const payload = {
      googleId: form.googleId,
      contactName: form.contactName,
      phoneNumber: form.phoneNumber,
      goal: form.goal,
      aiPersonality: form.personality,
      customScript: form.script,
      voiceChoice: form.voice,
    };

    try {
      const response = await scheduleCall(payload);
      console.log("Response:", response);
      alert("Call scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling call:", error);
      alert("Failed to schedule the call. Please try again.");
    }
  };

  return (
    <section
      id="Call"
      className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-[10vw] py-8 overflow-auto overflow-x-hidden"
    >

      <marquee direction="left" loop="" className=" text-white font-semibold py-2 px-4 rounded-lg mb-6 sm:text-sm text-xs">
          Due to Free Tier limitations, the call will schedule only registed(twilio) phone numbers.
        </marquee>
        
      <div className="max-w-2xl mx-auto text-white relative">
        {/* Top-right Try Example Button */}
        <button
          onClick={handleAutofill}
          className="absolute top-0 right-0 bg-transparent border-2 border-[#38E07A] text-[#38E07A] hover:bg-[#38E07A] hover:text-[#122117] font-semibold py-2 px-6 rounded-lg transition shadow-md sm:text-base text-sm"
        >
          Try Example
        </button>


        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-semibold mb-10">
          Call with AI Assistant
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Name */}
          <div>
            <label className="block mb-2">
              Name of Contact <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              placeholder="Enter contact name"
              required
              className="w-full px-4 py-2 rounded-lg bg-[#152515] border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="+91 1234567890"
              required
              className="w-full px-4 py-2 rounded-lg bg-[#152515] border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Goal */}
          <div>
            <label className="block mb-2">
              Goal of the Call <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="goal"
              value={form.goal}
              onChange={handleChange}
              placeholder="e.g., Product Feedback"
              required
              className="w-full px-4 py-2 rounded-lg bg-[#152515] border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Personality */}
          <div>
            <label className="block mb-2">
              AI Personality <span className="text-red-500">*</span>
            </label>
            <select
              name="personality"
              value={form.personality}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#152515] border border-green-700 text-white"
            >
              <option value="">Select personality</option>
              {Personalities.map((p, i) => (
                <option key={i} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Script */}
          <div>
            <label className="block mb-2">Custom Script (optional)</label>
            <textarea
              name="script"
              value={form.script}
              onChange={handleChange}
              rows="4"
              placeholder="Enter a custom message or leave blank"
              className="w-full px-4 py-2 rounded-lg bg-[#152515] border border-green-700 focus:outline-none"
            ></textarea>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block mb-2">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#152515] border border-green-700 text-white"
            >
              <option value="">Select language</option>
              {Object.keys(LanguageVoices).map((lang, i) => (
                <option key={i} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block mb-2">
              Voice <span className="text-red-500">*</span>
            </label>
            <select
              name="voice"
              value={form.voice}
              onChange={handleChange}
              required
              disabled={!form.language}
              className="w-full px-4 py-2 rounded-lg bg-[#152515] border border-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {form.language ? "Select voice" : "Select language first"}
              </option>
              {getAvailableVoices().map((voice, i) => (
                <option key={i} value={voice.name}>
                  {voice.name} ({voice.gender})
                </option>
              ))}
            </select>
            {form.language && (
              <p className="text-xs text-gray-400 mt-1">
                Available voices for {form.language}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg transition-colors"
          >
            Schedule Call
          </button>
        </form>
      </div>
    </section>
  );
};

export default Call;