export const triggerEmojiRain = (setEmojis, score) => {
  let emoji, count, minDuration, maxDuration;

  if (score <= 33) {
    emoji = "✅";
    count = Math.floor(Math.random() * 6) + 10; // 10-15
    minDuration = 2;
    maxDuration = 4; // gentle fall
  } else if (score <= 66) {
    emoji = Math.random() < 0.7 ? "⚠️" : "🚩"; // mostly ⚠️ with a few 🚩
    count = Math.floor(Math.random() * 6) + 15; // 15-20
    minDuration = 1.5;
    maxDuration = 3;
  } else {
    emoji = "🚩";
    count = Math.floor(Math.random() * 6) + 25; // 25-30
    minDuration = 0.8;
    maxDuration = 2; // fast and chaotic
  }

  const newEmojis = [];
  for (let i = 0; i < count; i++) {
    newEmojis.push({
      id: Date.now() + i,
      emoji,
      left: Math.random() * 100,
      size: 1 + Math.random() * 1.5,
      duration: minDuration + Math.random() * (maxDuration - minDuration),
      delay: Math.random() * 0.5,
      rotation: -30 + Math.random() * 60,
    });
  }

  setEmojis(newEmojis);

  setTimeout(() => {
    setEmojis([]);
  }, 4000);
};
