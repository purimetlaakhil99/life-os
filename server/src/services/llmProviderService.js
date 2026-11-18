// LIFE OS Modular LLM Provider Abstraction
import { ENV } from '../config/env.js';

/**
 * Call configured LLM provider (Gemini or OpenAI-compatible) with safe fallback.
 * Never throws unhandled network errors to callers; returns null if unavailable so
 * deterministic domain engines can respond cleanly.
 */
export async function generateLLMCompletion({ systemPrompt, userPrompt, temperature = 0.4, maxTokens = 1024 }) {
  const provider = (ENV.LLM_PROVIDER || 'gemini').toLowerCase();

  if (provider === 'gemini' && ENV.GEMINI_API_KEY) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(ENV.GEMINI_API_KEY)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      });

      if (!res.ok) {
        console.warn(`[LLMProvider] Gemini API returned ${res.status}`);
        return null;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : null;
    } catch (err) {
      console.warn('[LLMProvider] Gemini call failed, using fallback:', err.message);
      return null;
    }
  }

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature,
          max_tokens: maxTokens,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    } catch (err) {
      console.warn('[LLMProvider] OpenAI call failed, using fallback:', err.message);
      return null;
    }
  }

  return null;
}

export function getLLMStatus() {
  const provider = (ENV.LLM_PROVIDER || 'gemini').toLowerCase();
  const configured =
    (provider === 'gemini' && Boolean(ENV.GEMINI_API_KEY)) ||
    (provider === 'openai' && Boolean(process.env.OPENAI_API_KEY));
  return {
    provider,
    configured,
    mode: configured ? 'live_llm' : 'built_in_engine',
  };
}
