import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useChatStore } from "@/stores/chatStore";
import useModelStore from "@/stores/modelStore";
import { Activity, X } from "lucide-react";

interface ModelProps {
  modelPath: string;
}

function Model({ modelPath }: ModelProps) {
  const group = useRef<THREE.Group>(null);
  const fbx = useFBX(modelPath);
  const { actions, names } = useAnimations(fbx.animations, group);
  const { activeAnimation } = useChatStore();
  const { xPosition, yPosition, zoom } = useModelStore();

  // Part 1: Tune material properties to eliminate excessive metallic/chrome gloss
  useEffect(() => {
    if (fbx) {
      fbx.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (child.material.specularMap) {
            child.material.specularMap = null;
          }

          child.material.metalness = 0.05;
          child.material.roughness = 0.82;
          child.material.envMapIntensity = 0.25;

          if ("clearcoat" in child.material) {
            child.material.clearcoat = 0;
            child.material.clearcoatRoughness = 1;
          }

          child.material.needsUpdate = true;
        }
      });
    }
  }, [fbx]);

  // Handle animation transitions
  useEffect(() => {
    if (names.length > 0) {
      const actionName = names[0];
      if (actions[actionName]) {
        actions[actionName]?.reset().fadeIn(0.5).play();
        return () => {
          actions[actionName]?.fadeOut(0.5);
        };
      }
    }
  }, [actions, names, modelPath, activeAnimation]);

  // Part 6: Smooth camera/model lerp easing interpolation
  useFrame((_, delta) => {
    if (!group.current) return;

    const targetX = xPosition * 0.35;
    const targetY = yPosition * 0.35;
    const targetScale = 0.01 * zoom;
    const lerpSpeed = Math.min(1, delta * 12);

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, lerpSpeed);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, lerpSpeed);
    group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, targetScale, lerpSpeed);
    group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, targetScale, lerpSpeed);
    group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, targetScale, lerpSpeed);
  });

  const initialX = xPosition * 0.35;
  const initialY = yPosition * 0.35;
  const initialScale = 0.01 * zoom;

  return (
    <primitive
      key={modelPath}
      ref={group}
      object={fbx}
      position={[initialX, initialY, 0]}
      scale={initialScale}
    />
  );
}

function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0891B2] border-t-transparent"></div>
    </div>
  );
}

export function CharacterViewer() {
  const { activeExercise, setActiveExercise } = useChatStore();
  const modelPath = activeExercise ? activeExercise.fbx_path : "/models/Idle_Transition.fbx";

  return (
    <div className="relative h-full w-full rounded-2xl bg-transparent overflow-hidden flex items-center justify-center">
      {/* Active Exercise Overlay Banner */}
      {activeExercise && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between bg-[#11222C]/90 backdrop-blur-md border border-[#0891B2]/50 text-white px-3 py-2 rounded-xl shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0891B2] animate-pulse" />
            <div>
              <div className="font-semibold text-xs text-white">{activeExercise.title}</div>
              <div className="text-[10px] text-gray-300">{activeExercise.target_area} • {activeExercise.difficulty}</div>
            </div>
          </div>
          <button
            onClick={() => setActiveExercise(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Reset to Idle Model"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Suspense fallback={<Loader />}>
        <Canvas camera={{ position: [0, 1.2, 3.2], fov: 50 }}>
          {/* Part 2: Medical visualization soft lighting setup */}
          <ambientLight intensity={0.6} color="#ffffff" />
          <hemisphereLight args={["#ffffff", "#11222C", 1]} />
          <directionalLight position={[2, 4, 3]} intensity={0.2} color="#ffffff" />
          <spotLight position={[-2, 1.5, -2]} intensity={0.1} color="#0891B2" />
          <Model modelPath={modelPath} />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default CharacterViewer;
