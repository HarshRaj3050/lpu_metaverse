import { ContactShadows, Environment, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AnimatedWoman } from "./AnimatedWoman";
import { charactersAtom, socket } from "./SocketManager";
import { BuildingWithCollider } from "./BuildingWithCollider";
import { Physics, RigidBody, CuboidCollider, CapsuleCollider } from "@react-three/rapier";

const MOVE_SPEED = 5;       // units per second (delta-time based)
const CAM_DISTANCE = 8;
const CAM_HEIGHT = 4;
const CAM_LERP = 0.1;       // much smoother camera follow
const EMIT_INTERVAL = 50;   // ms between socket emits (~20 updates/sec)

// ─── Keyboard hook ────────────────────────────────────────────
function useKeys() {
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true);
    const up = (e) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return keys;
}

// ─── Atom to share the local player's physics position ────────
// This allows AnimatedWoman to use the physics-driven position
// instead of the server-echoed position for the local player.
import { atom } from "jotai";
export const localPlayerPosAtom = atom(null); // THREE.Vector3 or null

// ─── Third-person controller (physics-based) ──────────────────
function ThirdPersonController({ characters }) {
  const { camera, gl } = useThree();
  const keys = useKeys();
  const rigidBodyRef = useRef();

  const yaw = useRef(Math.PI);   // horizontal camera angle
  const pitch = useRef(0.4);     // vertical camera angle (radians)
  const isLocked = useRef(false);
  const lastEmitTime = useRef(0);

  // Pre-allocated vectors to avoid per-frame garbage collection
  const _forward = useRef(new THREE.Vector3());
  const _right = useRef(new THREE.Vector3());
  const _move = useRef(new THREE.Vector3());
  const _camTarget = useRef(new THREE.Vector3());
  const _lookAt = useRef(new THREE.Vector3());



  const [, setLocalPos] = useAtom(localPlayerPosAtom);

  // Pointer lock — click canvas to capture mouse
  useEffect(() => {
    const canvas = gl.domElement;

    const lock = () => canvas.requestPointerLock();

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    const onMouseMove = (e) => {
      if (!isLocked.current) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current = Math.max(-0.1, Math.min(1.0, pitch.current + e.movementY * 0.002));
    };

    canvas.addEventListener("click", lock);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      canvas.removeEventListener("click", lock);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl]);

  // Sync initial position from server data
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    const me = characters.find((c) => c.id === socket.id);
    if (me && rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(
        { x: me.position[0], y: 1, z: me.position[2] },
        true
      );
      initialized.current = true;
    }
  }, [characters]);

  useFrame((_, delta) => {
    const rb = rigidBodyRef.current;
    if (!rb) return;

    // Cap delta to avoid huge jumps on tab-switch or lag spikes
    const dt = Math.min(delta, 0.1);

    // Get current position from physics body
    const pos = rb.translation();

    // Direction vectors derived from camera yaw (reuse pre-allocated vectors)
    const forward = _forward.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = _right.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    const move = _move.current.set(0, 0, 0);

    if (keys.current["KeyW"] || keys.current["ArrowUp"]) move.add(forward);
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) move.sub(forward);
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) move.sub(right);
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) move.add(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED);
      // Set linear velocity — Rapier handles collision resolution automatically
      rb.setLinvel({ x: move.x, y: rb.linvel().y, z: move.z }, true);

      // Throttle socket emissions to avoid flooding the server
      const now = performance.now();
      if (now - lastEmitTime.current >= EMIT_INTERVAL) {
        lastEmitTime.current = now;
        socket.emit("move", [pos.x, 0, pos.z]);
      }
    } else {
      // Stop horizontal movement but preserve vertical velocity (gravity)
      rb.setLinvel({ x: 0, y: rb.linvel().y, z: 0 }, true);
    }

    // Clamp to floor bounds (safety net)
    if (pos.x < -35 || pos.x > 35 || pos.z < -35 || pos.z > 35) {
      rb.setTranslation(
        {
          x: Math.max(-35, Math.min(35, pos.x)),
          y: pos.y,
          z: Math.max(-35, Math.min(35, pos.z)),
        },
        true
      );
    }

    // Share physics position with AnimatedWoman for the local player
    setLocalPos(new THREE.Vector3(pos.x, 0, pos.z));

    // Camera: spherical orbit around character (reuse vectors)
    const cosP = Math.cos(pitch.current);
    const sinP = Math.sin(pitch.current);
    _camTarget.current.set(
      pos.x + Math.sin(yaw.current) * CAM_DISTANCE * cosP,
      pos.y + sinP * CAM_DISTANCE + CAM_HEIGHT * 0.3,
      pos.z + Math.cos(yaw.current) * CAM_DISTANCE * cosP
    );

    camera.position.lerp(_camTarget.current, CAM_LERP);
    _lookAt.current.set(pos.x, pos.y + 1.5, pos.z);
    camera.lookAt(_lookAt.current);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={[0, 1, 0]}
      lockRotations                    // Prevent character from tipping over
      enabledRotations={[false, false, false]}
      colliders={false}
      mass={1}
      linearDamping={5}                // Slight damping for smoother stops
    >
      {/* Capsule collider sized to match the character model */}
      <CapsuleCollider args={[0.5, 0.3]} position={[0, 0.8, 0]} />
    </RigidBody>
  );
}

// ─── Experience ───────────────────────────────────────────────
export const Experience = () => {
  const [characters] = useAtom(charactersAtom);
  const [localPos] = useAtom(localPlayerPosAtom);
  const [onFloor, setOnFloor] = useState(false);
  useCursor(onFloor);

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.3} />
      <ContactShadows blur={2} />

      {/*
        Physics world — set debug to see green collider wireframes.
        Remove `debug` once your colliders are positioned correctly.
      */}
      <Physics gravity={[0, -9.81, 0]}>
        {/* Building with collision walls */}
        <BuildingWithCollider />

        {/* Player physics body (invisible — just the collider) */}
        <ThirdPersonController characters={characters} />

        {/* Floor as a static rigid body */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[35, 0.01, 35]} position={[0, -0.001, 0]} />
          <mesh
            rotation-x={-Math.PI / 2}
            position-y={-0.001}
            onPointerEnter={() => setOnFloor(true)}
            onPointerLeave={() => setOnFloor(false)}
          >
            <planeGeometry args={[70, 70]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
        </RigidBody>
      </Physics>

      {/* Character models (rendered OUTSIDE physics, they follow positions) */}
      {characters.map((character) => {
        const isLocalPlayer = character.id === socket.id;
        // Local player uses physics position; remote players use server data
        const position = isLocalPlayer && localPos
          ? localPos
          : new THREE.Vector3(...character.position);

        return (
          <AnimatedWoman
            key={character.id}
            position={position}
            hairColor={character.hairColor}
            topColor={character.topColor}
            bottomColor={character.bottomColor}
          />
        );
      })}
    </>
  );
};