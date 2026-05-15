import Groq from "groq-sdk";

let groq: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set");
    }
    groq = new Groq({ apiKey });
  }
  return groq;
}
