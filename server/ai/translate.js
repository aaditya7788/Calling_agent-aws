import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import translate from 'translate-google';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from '../key.js';

// Initialize AWS Translate Client
const translateClient = new TranslateClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Translate text using Google Translate (fallback, free, no API key needed)
 */
const translateWithGoogle = async (text, targetLang) => {
  try {
    const result = await translate(text, { to: targetLang });
    return result;
  } catch (error) {
    console.error('❌ Google Translate error:', error.message);
    throw error;
  }
};

/**
 * Translate text from source language to target language using AWS Translate
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (e.g., 'en')
 * @param {string} targetLanguage - Target language code (e.g., 'hi')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, sourceLanguage = 'en', targetLanguage = 'hi') => {
  try {
    console.log(`🌐 Translating text from ${sourceLanguage} to ${targetLanguage}...`);
    
    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage,
    });

    const response = await translateClient.send(command);
    console.log(`✅ Translation successful`);
    
    return response.TranslatedText;
  } catch (error) {
    console.error('❌ AWS Translation error:', error.message);
    
    // Fallback to Google Translate
    console.log('🔄 Trying Google Translate as fallback...');
    return await translateWithGoogle(text, targetLanguage);
  }
};

/**
 * Auto-detect and translate text based on target language
 * @param {string} text - Text to translate
 * @param {string} targetLanguageCode - Target language code (en-US, hi-IN, etc.)
 * @returns {Promise<string>} - Translated text or original if no translation needed
 */
export const autoTranslate = async (text, targetLanguageCode) => {
  try {
    // Map language codes to AWS Translate language codes
    const languageMap = {
      'en-US': 'en',
      'en-IN': 'en',
      'hi-IN': 'hi',
    };

    const targetLang = languageMap[targetLanguageCode];
    
    // If target is English or not supported, return original text
    if (!targetLang || targetLang === 'en') {
      return text;
    }

    // Detect if text is already in target language (basic check)
    const isEnglishText = /^[\x00-\x7F\s]+$/.test(text);
    
    // If target is Hindi and text is in English, translate
    if (targetLang === 'hi' && isEnglishText) {
      return await translateText(text, 'en', 'hi');
    }

    // Otherwise return original
    return text;
  } catch (error) {
    console.error('❌ Auto-translate error:', error);
    // Return original text if translation fails
    return text;
  }
};
