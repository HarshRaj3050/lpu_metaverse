import { Canvas } from "@react-three/fiber";
import { Experience } from "../../components/Experience";
import { SocketManager } from "../../components/SocketManager";
import { ChatBox } from "../../components/ChatBox";
import { OnlinePlayersList } from "../../components/OnlinePlayersList";
import { VoiceChat } from "../../components/VoiceChat";
import { ControlsHUD } from "../../components/ControlsHUD";
import { useState, useEffect } from "react";

function MetaVerse() {
  const [isTooSmall, setIsTooSmall] = useState(window.innerWidth < 700);

  useEffect(() => {
    const handleResize = () => setIsTooSmall(window.innerWidth < 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isTooSmall) {
    return (
      <>
        <style>{`
          .device-notice {
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f0f1e, #1a1a3e);
            color: #fff;
            text-align: center;
            padding: 32px;
            z-index: 9999;
            font-family: 'Segoe UI', system-ui, sans-serif;
          }
          .device-notice-icon {
            font-size: 64px;
            margin-bottom: 24px;
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .device-notice h2 {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 12px;
            letter-spacing: 0.5px;
          }
          .device-notice p {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            max-width: 320px;
            line-height: 1.6;
            margin: 0;
          }
          .device-notice .badge {
            margin-top: 24px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 12px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            font-size: 13px;
            color: rgba(255,255,255,0.7);
          }
        `}</style>
        <div className="device-notice">
          <div className="device-notice-icon">🖥️</div>
          <h2>Desktop Required</h2>
          <p>
            The Metaverse experience requires a larger screen.
            Please switch to a desktop or laptop for the best experience.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SocketManager />
      <OnlinePlayersList />
      <ControlsHUD />
      <ChatBox />
      <VoiceChat />
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 30 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience />
      </Canvas>
    </>
  );
}

export default MetaVerse;
