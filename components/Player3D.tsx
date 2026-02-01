import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Player, Expression } from '../types';
import { AVATAR_COLORS } from '../constants';

interface Player3DProps {
  player: Player;
  position?: [number, number, number];
  isReady?: boolean;
}

const getFeatures = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  const eyeType = Math.abs(hash >> 1) % 3;
  const mouthType = Math.abs(hash >> 2) % 3;
  const accessory = Math.abs(hash >> 3) % 2;
  
  return { color: AVATAR_COLORS[colorIndex], eyeType, mouthType, accessory };
};

// --- SUB-COMPONENTS ---

const Particles = ({ expression }: { expression: Expression }) => {
    const particles = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (particles.current) {
            particles.current.rotation.y += 0.02;
            particles.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    if (expression === 'THINKING') {
        return (
            <group ref={particles} position={[0.4, 0.8, 0]}>
                 <mesh>
                     <torusGeometry args={[0.1, 0.02, 8, 16]} />
                     <meshBasicMaterial color="#FFD700" />
                 </mesh>
                 <mesh position={[0.2, 0.2, 0]}>
                     <sphereGeometry args={[0.05]} />
                     <meshBasicMaterial color="#FFD700" />
                 </mesh>
            </group>
        );
    }
    if (expression === 'SHOCKED') {
        return (
            <group ref={particles} position={[0, 0.8, 0]}>
                <mesh position={[0.3, 0, 0]} rotation={[0, 0, 0.5]}>
                    <boxGeometry args={[0.05, 0.3, 0.05]} />
                    <meshBasicMaterial color="#00FFFF" />
                </mesh>
                <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[0.05, 0.3, 0.05]} />
                    <meshBasicMaterial color="#00FFFF" />
                </mesh>
            </group>
        );
    }
    return null;
}

const Eyebrows = ({ expression }: { expression: Expression }) => {
    let leftRot = 0;
    let rightRot = 0;
    let yOffset = 0.18;

    if (expression === 'SAD') {
        leftRot = -0.4;
        rightRot = 0.4;
        yOffset = 0.20;
    } else if (expression === 'SHOCKED') {
        yOffset = 0.25;
    } else if (expression === 'SMUG') {
        leftRot = 0.3;
        rightRot = 0.1;
    } else if (expression === 'THINKING') {
        leftRot = -0.2;
        yOffset = 0.22;
    }

    return (
        <group position={[0, yOffset, 0.3]}>
             {/* Left Eyebrow */}
             <mesh position={[-0.12, 0, 0]} rotation={[0, 0, leftRot]}>
                 <boxGeometry args={[0.08, 0.02, 0.01]} />
                 <meshBasicMaterial color="black" />
             </mesh>
             {/* Right Eyebrow */}
             <mesh position={[0.12, 0, 0]} rotation={[0, 0, rightRot]}>
                 <boxGeometry args={[0.08, 0.02, 0.01]} />
                 <meshBasicMaterial color="black" />
             </mesh>
        </group>
    );
};

// Renders the Eye shape
const EyeShape = ({ type, side, blinking, expression }: { type: 'DOT' | 'LINE' | 'RECT', side: 'L' | 'R', blinking: boolean, expression: Expression }) => {
  const xOffset = side === 'L' ? -0.12 : 0.12;
  
  // Expression overrides for eyes
  if (expression === 'HAPPY') {
       return (
       <mesh position={[xOffset, 0, 0]} rotation={[0, 0, 0]}>
          <ringGeometry args={[0.03, 0.04, 16, 1, 0, Math.PI]} />
          <meshBasicMaterial color="black" side={THREE.DoubleSide} />
       </mesh>
     );
  }

  if (blinking) {
     return (
        <mesh position={[xOffset, 0, 0]}>
           <planeGeometry args={[0.08, 0.01]} />
           <meshBasicMaterial color="black" />
        </mesh>
     );
  }

  if (expression === 'SHOCKED') {
    return (
      <group position={[xOffset, 0, 0]}>
        <mesh>
          <circleGeometry args={[0.06, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
           <circleGeometry args={[0.015, 32]} />
           <meshBasicMaterial color="black" />
        </mesh>
      </group>
    );
  }

  if (type === 'LINE') {
     return (
       <mesh position={[xOffset, 0, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.06, 0.01]} />
           <meshBasicMaterial color="black" />
       </mesh>
     );
  }

  if (type === 'RECT') {
      return (
        <group position={[xOffset, 0, 0]}>
            <mesh>
                <planeGeometry args={[0.08, 0.05]} />
                <meshBasicMaterial color="white" />
            </mesh>
            <mesh position={[0,0,0.001]}>
                <circleGeometry args={[0.015]} />
                <meshBasicMaterial color="black" />
            </mesh>
        </group>
      );
  }

  // Default DOT
  return (
    <group position={[xOffset, 0, 0]}>
      <mesh>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
         <circleGeometry args={[0.015, 16]} />
         <meshBasicMaterial color="black" />
      </mesh>
    </group>
  );
};

const MouthShape = ({ type, expression }: { type: number, expression: Expression }) => {
   
   if (expression === 'SHOCKED') {
       return (
         <mesh position={[0, -0.15, 0]}>
            <circleGeometry args={[0.06, 16]} />
            <meshBasicMaterial color="black" />
         </mesh>
       );
   }
   
   if (expression === 'HAPPY') {
       return (
         <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]}>
            <ringGeometry args={[0.06, 0.08, 16, 1, 0, Math.PI]} />
            <meshBasicMaterial color="black" side={THREE.DoubleSide} />
         </mesh>
       );
   }

   if (expression === 'SAD') {
        return (
         <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
            <ringGeometry args={[0.06, 0.08, 16, 1, 0, Math.PI]} />
            <meshBasicMaterial color="black" side={THREE.DoubleSide} />
         </mesh>
       );
   }
   
   if (type === 1) { // Open / Circle
       return (
         <mesh position={[0, -0.15, 0]}>
            <circleGeometry args={[0.03, 16]} />
            <meshBasicMaterial color="black" />
         </mesh>
       );
   }
   if (type === 2) { // Line
       return (
         <mesh position={[0, -0.15, 0]}>
            <planeGeometry args={[0.1, 0.02]} />
            <meshBasicMaterial color="black" />
         </mesh>
       );
   }
   
   // Smile default
   return (
      <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]}>
        <ringGeometry args={[0.06, 0.07, 16, 1, 0, Math.PI]} />
        <meshBasicMaterial color="black" side={THREE.DoubleSide} />
      </mesh>
   );
};

export const Player3D: React.FC<Player3DProps> = ({ player, position = [0, 0, 0], isReady = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyMeshRef = useRef<THREE.Mesh>(null);
  const features = useMemo(() => getFeatures(player.avatarSeed), [player.avatarSeed]);
  
  const [blinking, setBlinking] = useState(false);
  
  // Physics State for Squash & Stretch
  const currentPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const velocityY = useRef(0);
  const scaleY = useRef(1);
  const targetPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const nextMoveTime = useRef(0);
  
  useEffect(() => {
      let timeout: number;
      const triggerBlink = () => {
         setBlinking(true);
         setTimeout(() => setBlinking(false), 150);
         timeout = window.setTimeout(triggerBlink, Math.random() * 3000 + 2000);
      };
      timeout = window.setTimeout(triggerBlink, Math.random() * 2000);
      return () => clearTimeout(timeout);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyMeshRef.current) return;
    
    // 1. Enter/Exit Scaling
    const targetScale = isReady ? 1 : 0.001;
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    groupRef.current.scale.set(newScale, newScale, newScale);

    if (!isReady) return;

    // 2. AI Logic (Movement)
    if (state.clock.elapsedTime > nextMoveTime.current) {
        nextMoveTime.current = state.clock.elapsedTime + 2 + Math.random() * 3;
        // Random move within radius
        targetPos.current.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 5);
        
        // Jump when picking new spot
        if (player.expression === 'HAPPY') velocityY.current = 0.2; 
        else velocityY.current = 0.1;
    }

    // 3. Physics (Movement towards target)
    const diff = new THREE.Vector3().subVectors(targetPos.current, currentPos.current);
    const dist = diff.length();
    
    if (dist > 0.1) {
        // Move
        const speed = player.expression === 'HAPPY' ? 3 : 1.5;
        diff.normalize().multiplyScalar(speed * delta);
        currentPos.current.add(diff);

        // Rotate to face
        const targetRot = Math.atan2(diff.x, diff.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot, 0.1);

        // Walk Bounce / Squash
        const walkCycle = Math.sin(state.clock.elapsedTime * 15);
        scaleY.current = 1 + walkCycle * 0.05;
        
    } else {
        // Idle
        // Face camera slowly
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
        
        // Idle Breathe
        scaleY.current = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02;
    }

    // 4. Expression Physics Overrides
    if (player.expression === 'SHOCKED') {
        // Vibrate
        currentPos.current.x += (Math.random() - 0.5) * 0.05;
        scaleY.current = 1.1; // Stretch thin
    } else if (player.expression === 'HAPPY') {
        // Jump check
        if (currentPos.current.y <= 0 && Math.random() < 0.02) {
             velocityY.current = 0.15;
        }
    } else if (player.expression === 'SAD') {
        scaleY.current = 0.9; // Squash down
    }

    // 5. Apply Gravity / Jumping
    velocityY.current -= 9.8 * delta * 0.05; // Low gravity
    currentPos.current.y += velocityY.current;

    if (currentPos.current.y < 0) {
        currentPos.current.y = 0;
        velocityY.current = 0;
        // Landing squash
        if (velocityY.current < -0.1) scaleY.current = 0.8;
    }

    // 6. Apply Transforms
    groupRef.current.position.copy(currentPos.current);
    
    // Apply Squash & Stretch to Body Mesh only (preserve head relative features somewhat)
    // Actually, simple scaling of the group Y looks funny enough
    bodyMeshRef.current.scale.set(1/scaleY.current, scaleY.current, 1/scaleY.current);

    // Head Group follows body but might look around (simplified here)
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Dynamic Particles above head */}
      <Particles expression={player.expression} />

      {/* Main Body (Squashable) */}
      <group ref={bodyMeshRef}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.35, 0.8, 4, 16]} />
            <meshStandardMaterial color={features.color} roughness={0.4} />
          </mesh>
      </group>

      {/* Face (Attached to group so it doesn't squash weirdly, or does it? 
          If we put it outside bodyMeshRef, it stays constant size. 
          Let's put it inside a group that tracks body height but maintains aspect ratio) 
      */}
      <group position={[0, 0.6, 0.32]}>
         {/* Eyes */}
         <EyeShape type={features.eyeType === 0 ? 'DOT' : features.eyeType === 1 ? 'LINE' : 'RECT'} side="L" blinking={blinking} expression={player.expression} />
         <EyeShape type={features.eyeType === 0 ? 'DOT' : features.eyeType === 1 ? 'LINE' : 'RECT'} side="R" blinking={blinking} expression={player.expression} />
         
         <Eyebrows expression={player.expression} />

         {/* Mouth */}
         <MouthShape type={features.mouthType} expression={player.expression} />
         
         {/* Accessory */}
         {features.accessory === 1 && (
             <group position={[0, 0, 0.05]}>
                 <mesh position={[-0.12, 0, 0]}>
                     <ringGeometry args={[0.05, 0.06, 32]} />
                     <meshBasicMaterial color="black" />
                 </mesh>
                 <mesh position={[0.12, 0, 0]}>
                     <ringGeometry args={[0.05, 0.06, 32]} />
                     <meshBasicMaterial color="black" />
                 </mesh>
                 <mesh position={[0, 0, 0]}>
                     <planeGeometry args={[0.1, 0.01]} />
                     <meshBasicMaterial color="black" />
                 </mesh>
             </group>
         )}
      </group>

      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="black" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};
