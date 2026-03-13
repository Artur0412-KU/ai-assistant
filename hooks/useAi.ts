import { useState } from "react";
import { generateAI } from "services/ai/ai";

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "system",
      content: "Ти асистент. Відповідай українською мовою. Не перекладай на англійську. Відповідай коротко і по суті."
    }
  ]);

  const askAI = async (prompt: string) => {
    try {
      setLoading(true);
      const newMessages = [...messages, { role: "user", content: prompt }];
      const result = await generateAI(prompt);
      setMessages([...newMessages, {role: 'user', content: prompt}])
      console.log('result [useAi]', prompt)
      setData(result ?? null);
    } catch (e) {
      setError(e);
      console.error(e)
    } finally {
      setLoading(false);
    }
  };

  return { askAI, data, loading, error };
};
