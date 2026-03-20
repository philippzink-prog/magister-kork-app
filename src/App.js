import React, { useState, useEffect } from "react";

export default function MagisterKorkApp() {
  const [form, setForm] = useState({
    wine: "",
    winemaker: "",
    origin: "",
    vintage: "",
    price: "",
    impressions: "",
  });

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("magister_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateCaption = async () => {
    setLoading(true);
    setOutput("");

    const prompt = `Rolle: Du bist der Social Media Copywriter für "Magister_Kork".

Ton: trocken, sarkastisch, nerdig.

Daten:
Wein: ${form.wine}
Winzer: ${form.winemaker}
Herkunft: ${form.origin}
Jahrgang: ${form.vintage}
Preis: ${form.price}
Eindrücke: ${form.impressions}

Struktur:
- Hook
- Die Akte
- Review
- Bewertung
- Frage
- Signatur
- Hashtags`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`,
        },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "Fehler";

      setOutput(text);

      const newHistory = [text, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem("magister_history", JSON.stringify(newHistory));
    } catch (error) {
      setOutput("Fehler: " + error.message);
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Magister Posting Maschine</h1>

      <input name="wine" placeholder="Wein" onChange={handleChange} className="w-full mb-2 p-2 border" />
      <input name="winemaker" placeholder="Winzer" onChange={handleChange} className="w-full mb-2 p-2 border" />
      <input name="origin" placeholder="Herkunft" onChange={handleChange} className="w-full mb-2 p-2 border" />
      <input name="vintage" placeholder="Jahrgang" onChange={handleChange} className="w-full mb-2 p-2 border" />
      <input name="price" placeholder="Preis" onChange={handleChange} className="w-full mb-2 p-2 border" />
      <textarea name="impressions" placeholder="Deine Eindrücke" onChange={handleChange} className="w-full mb-2 p-2 border" />

      <button onClick={generateCaption} className="bg-black text-white px-4 py-2 rounded mt-2">
        {loading ? "Magister denkt..." : "Generieren"}
      </button>

      {output && (
        <div className="mt-4 p-4 border bg-gray-100">
          <pre className="whitespace-pre-wrap">{output}</pre>
          <button onClick={copyToClipboard} className="mt-2 bg-gray-800 text-white px-3 py-1 rounded">
            Copy für Instagram
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold mb-2">Letzte Posts</h2>
          {history.map((item, i) => (
            <div key={i} className="text-sm border p-2 mb-2 bg-white">
              {item.substring(0, 120)}...
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
