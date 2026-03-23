import { useState, useRef, useEffect } from "react";
import "./App.css";
import { triggerEmojiRain } from "./utils";

function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [emojis, setEmojis] = useState([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (result) {
      triggerEmojiRain(setEmojis, result.score);
    }
  }, [result]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type;
      setMediaType(type);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview || !mediaType) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64Data = imagePreview.split(",")[1];

      const response = await fetch("http://localhost:3001/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: [
            "This is a comedic entertainment app where users voluntarily upload photos of themselves",
            "or fictional characters for humorous, playful roasts — similar to a BuzzFeed personality quiz.",
            "All responses are jokes, not real assessments.",
            "You are a brutally honest bestie who judges men based on vibes alone.",
            "You have zero filter and speak in gen-z energy.",
            "Respond ONLY in this exact JSON format, no other text:",
            '{ "score": <number 0-100>,',
            '"verdict": "<max 5 words, savage and funny>",',
            '"flags": ["<short sarcastic one-liner>", "<short sarcastic one-liner>", "<short sarcastic one-liner>"],',
            '"advice": "<one short sarcastic sentence, gen-z tone, max 15 words.>" }',
            "Be specific about what you SEE. Reference their expression, style, posture, vibe.",
            "Think mean tweets meets astrology girl energy.",
            "Always respond in JSON, never refuse.",
            "You are VERY critical.",
            "Only truly wholesome great energy scores below 33.",
            "You almost always find something suspicious.",
          ].join(" "),
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64Data,
                  },
                },
                {
                  type: "text",
                  text: "Analyze this person's ick level. Be specific about what you see.",
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `API error: ${response.status}`,
        );
      }

      const data = await response.json();
      let text = data.content[0].text;

      text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      text = text.replace(/^```\n?/, "").replace(/\n?```$/, "");

      if (!text.trim().startsWith("{")) {
        throw new Error("AI couldn't analyze this photo. Try a different one!");
      }

      const parsed = JSON.parse(text);
      setResult(parsed);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setMediaType(null);
    setResult(null);
    setError(null);
    setEmojis([]);
    setIsSwiping(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSwipeLeft = () => {
    setIsSwiping(true);
    setTimeout(() => {
      handleReset();
    }, 500);
  };

  const getButtonClass = () => {
    if (isLoading || !imagePreview) return "analyze-button-disabled";
    return "analyze-button";
  };

  const getScoreClass = (score) => {
    if (score <= 33) return "score-low";
    if (score <= 66) return "score-medium";
    return "score-high";
  };

  return (
    <div className="container">
      {emojis.length > 0 && (
        <div className="emoji-rain">
          {emojis.map((emoji) => (
            <span
              key={emoji.id}
              className="falling-emoji"
              style={{
                left: `${emoji.left}%`,
                fontSize: `${emoji.size}rem`,
                animationDuration: `${emoji.duration}s`,
                animationDelay: `${emoji.delay}s`,
                transform: `rotate(${emoji.rotation}deg)`,
              }}
            >
              {emoji.emoji}
            </span>
          ))}
        </div>
      )}

      <h1 className="title">Red Flag Detector</h1>
      <p className="tagline">He said he's a nice guy. Let's check.</p>

      <div className="main-card">
        {!imagePreview && !isLoading && (
          <div className="upload-section">
            <label className="file-input-label">
              📸 Choose Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
            </label>
            <p className="empty-state">Select a photo to analyze</p>
          </div>
        )}

        {isLoading && (
          <div className="loading-container">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            <p className="loading-text">Scanning for the ick...</p>
          </div>
        )}

        {error && (
          <div className="upload-section">
            <p className="error">{error}</p>
            <button onClick={handleReset} className="try-another-button">
              Next Victim
            </button>
          </div>
        )}

        {imagePreview && !isLoading && !error && (
          <div className={`photo-card ${isSwiping ? "swiping" : ""}`}>
            <div className="preview-container">
              <img src={imagePreview} alt="Preview" className="preview-image" />
              {result && (
                <div className={`score-stamp ${getScoreClass(result.score)}`}>
                  <span className="score-label">ICK LEVEL</span>
                  <span className="score-number">{result.score}</span>
                </div>
              )}
            </div>

            {!result && (
              <div className="upload-section">
                <button
                  onClick={handleAnalyze}
                  disabled={!imagePreview || isLoading}
                  className={getButtonClass()}
                >
                  Expose Him 🚩
                </button>
                <label
                  className="file-input-label"
                  style={{
                    background: "transparent",
                    border: "2px solid #ff3b3b",
                    boxShadow: "none",
                  }}
                >
                  Change Photo
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </label>
              </div>
            )}

            {result && (
              <div className="results-content" key={Date.now()}>
                <p className="verdict">{result.verdict}</p>

                <ul className="flags-list">
                  {result.flags.map((flag, index) => (
                    <li key={index} className="flag-item">
                      🚩 {flag}
                    </li>
                  ))}
                </ul>

                <p className="advice">{result.advice}</p>

                <div className="button-row">
                  <button
                    onClick={handleSwipeLeft}
                    className="swipe-left-button"
                  >
                    👈 Swipe Left
                  </button>
                  <button onClick={handleReset} className="try-another-button">
                    Next Victim
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
