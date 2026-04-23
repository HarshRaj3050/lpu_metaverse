import { useAtom } from "jotai";
import { useState } from "react";
import { inMetaverseAtom } from "./SocketManager";

export const ControlsHUD = () => {
  const [inMetaverse] = useAtom(inMetaverseAtom);
  const [visible, setVisible] = useState(true);

  if (!inMetaverse) return null;

  const controls = [
    { keys: "W / S", action: "Forward / Backward" },
    { keys: "A / D", action: "Left / Right" },
    { keys: "Mouse", action: "Look Around" },
    { keys: "Click", action: "Lock Cursor" },
    { keys: "Esc", action: "Unlock Cursor" },
  ];

  return (
    <>
      <style>{`
        .chud-toggle {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 150;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.2);
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: rgba(255,255,255,0.9);
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          pointer-events: auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.25);
        }
        .chud-toggle:hover {
          background: rgba(0,0,0,0.6);
          color: #fff;
          transform: scale(1.1);
        }

        .chud-overlay {
          position: fixed;
          top: 64px;
          right: 16px;
          z-index: 140;
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s ease;
          padding: 4px 0;
        }
        .chud-overlay.chud-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .chud-overlay.chud-hidden {
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
        }

        .chud-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .chud-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chud-key {
          font-family: 'Segoe UI', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 5px;
          padding: 2px 8px;
          min-width: 56px;
          text-align: center;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        .chud-label {
          font-family: 'Segoe UI', system-ui, sans-serif;
          font-size: 11px;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.3px;
          white-space: nowrap;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* Toggle Button */}
      <button
        className="chud-toggle"
        onClick={() => setVisible((v) => !v)}
        title={visible ? "Hide controls" : "Show controls"}
      >
        {visible ? "✕" : "?"}
      </button>

      {/* Controls Overlay */}
      <div className={`chud-overlay ${visible ? "chud-visible" : "chud-hidden"}`}>
        <div className="chud-list">
          {controls.map((c, i) => (
            <div className="chud-row" key={i}>
              <span className="chud-key">{c.keys}</span>
              <span className="chud-label">{c.action}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
