
import React, { useEffect, useState } from "react";
import "./LoadingScreen.css";

type LoadingScreenProps = {
  onComplete: () => void;
};

export default function LoadingScreen({
  onComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((previous) => {
        if (previous >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return Math.min(previous + 2, 100);
      });
    }, 45);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = window.setTimeout(onComplete, 600);
      return () => window.clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div className="luna-loading">
      <div className="loading-glow" />

      <div className="loading-content">
        <div className="loading-eagle">🦅</div>

        <h1>LUNA <span>AI</span></h1>

        <p className="loading-subtitle">
          INTELLIGENCE REDEFINED
        </p>

        <div className="loading-bar">
          <div
            className="loading-progress"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loading-status">
          <span>INITIALIZING LUNA</span>
          <span>{progress}%</span>
        </div>

        <p className="loading-footer">
          YOUR BUSINESS. YOUR AI AGENT.
        </p>
      </div>
    </div>
  );
}
