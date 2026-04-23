import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";

/**
 * BuildingWithCollider — loads the LPU building GLB and wraps it
 * in a fixed rigid body with auto-generated trimesh colliders.
 *
 * `colliders="trimesh"` tells Rapier to scan every triangle in the
 * 3D model and build an exact collision shape from it. This means
 * the collider perfectly matches every wall, door frame, column, etc.
 *
 * This only works well for STATIC (type="fixed") bodies.
 *
 * All building meshes are placed on THREE.js layer 1 so the camera
 * raycast can target ONLY building geometry (ignoring floor, player, etc.).
 */
export const BuildingWithCollider = () => {
  const { scene } = useGLTF("/models/items/lpu34.glb");

  // Put every mesh in the building on layer 1 for camera raycasting
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.layers.enable(1);
      }
    });
  }, [scene]);

  return (
    <RigidBody type="fixed" colliders="trimesh" name="building">
      {/* Visual model — Rapier reads its geometry to build colliders */}
      <primitive object={scene} />
    </RigidBody>
  );
};
