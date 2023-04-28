/* eslint-disable react/no-unknown-property */
import React, { Suspense, useEffect, useRef } from 'react';
import { useThree, extend, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Center, OrbitControls, PerspectiveCamera, TransformControls } from '@react-three/drei';
import { Mesh } from 'three';
import * as THREE from 'three';
import gsap from 'gsap';

export const experienceConfig = {
  objectsDistance: 4,
  sparkles: {
    size: 10,
    count: 300,
    scale: new THREE.Vector3(30, 40, 40),
    positionY: 1,
    speed: 0.2,
  },
};

export interface SceneSectionProps {
  name: string;
  count: number;
  children: React.ReactNode;
  props?: any;
}

export function R3FSceneSection({ name, count, children, ...props }: SceneSectionProps) {
  const group = useRef(null);
  const { objectsDistance } = experienceConfig;
  // const { layers } = props;
  // useLayoutEffect(() => {
  //   group.current.layers.enable(layers);
  // }, [layers])
  // if (group.current) {
  //   console.log('section grp cur: ', group.current);
  // }
  return (
    <group ref={group} name={name} position={[0, -objectsDistance * count, 0]} {...props}>
      {children}
    </group>
  );
}

function Experience() {
  const mesh = useRef<Mesh>(null);
  const sphereRef = useRef<Mesh>(null);
  const sparkleColor = new THREE.Color(0x1f8975);
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  const scrollY = useRef(0);
  const sizes = useRef({ width: 0, height: 0 });
  const cursor = useRef({ x: 0, y: 0 });
  const mousePos = useRef(new THREE.Vector2());
  const mouse = new THREE.Vector2();
  const plant1 = useRef<Mesh>(null);
  const camera = useRef();
  const cameraGroup = useRef();
  const { objectsDistance, sparkles } = experienceConfig;
  const clock = new THREE.Clock();
  let previousTime = 0;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sizes.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Scroll
      scrollY.current = window.scrollY;
      let currentSection = 0;
      window.addEventListener('resize', () => {
        // Update sizes
        sizes.current.width = window.innerWidth;
        sizes.current.height = window.innerHeight;
      });

      window.addEventListener('scroll', () => {
        scrollY.current = window.scrollY;

        // console.log(scrollY);

        const newSection = Math.round(scrollY.current / sizes.current.height);
        if (newSection !== currentSection) {
          currentSection = newSection;

          // if (cameraGroup.current) {
          //   switch (currentSection) {
          //     case 0:
          //       gsap.to(cameraGroup.current.position, {
          //         delay: 0.5,
          //         duration: 1,
          //         y: 0,
          //         ease: "power2.out",
          //       });
          //       break;
          //     case 1:
          //       gsap.to(cameraGroup.current.position, {
          //         duration: 1,
          //         y: experienceConfig.objectsDistance * 1,
          //         delay: 0.5,
          //         ease: "power2.out",
          //       });
          //       break;
          //     case 2:
          //       gsap.to(cameraGroup.current.position, {
          //         duration: 1,
          //         y: experienceConfig.objectsDistance * 2,
          //         delay: 0.5,
          //         ease: "power2.out",
          //       });
          //       break;
          //     default:
          //       gsap.to(cameraGroup.current.position, {
          //         duration: 1,
          //         y: 0,
          //         delay: 0.5,
          //         ease: "power2.out",
          //       });
          //       break;
          //   }
          // }
        }
      });

      // Mouse move
      window.addEventListener('mousemove', (event) => {
        cursor.current.x = event.clientX / sizes.current.width - 0.3;
        cursor.current.y = -(event.clientY / sizes.current.height) - 0.3;
        // console.log('curCursor', cursor.current);

        mousePos.current.x = (event.clientX / sizes.current.width) * 2 - 1;
        mousePos.current.y = -(event.clientY / sizes.current.height) * 2 - 1;

        // mouse.position.x = event.clientX / sizes.current.width
        // mouse.position.y = event.clientY / sizes.current.height
        // console.log('mouse pos', mouse);
      });
    }
  }, []);

  useFrame(() => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    const parallaxX = cursor.current.x * 0.5;
    const parallaxY = cursor.current.y * 0.5;

    if (camera.current && cameraGroup.current) {
      camera.current.position.y = (-scrollY.current / sizes.current.height) * objectsDistance;
      cameraGroup.current.position.x += (parallaxX - cameraGroup.current.position.x) * 5 * deltaTime;
      cameraGroup.current.position.y += (parallaxY - cameraGroup.current.position.y) * 5 * deltaTime;
    }
  });

  return (
    <>
      <Suspense fallback={null}>
        <group ref={cameraGroup}>
          <PerspectiveCamera
            ref={camera}
            makeDefault
            aspect={sizes.width / sizes.height}
            position={[0, 0, 0]}
            far={400}
            filmGauge={53}
          />
        </group>

        <R3FSceneSection name="SectionOne" count={0}>
          <directionalLight position={[1, 2, 3]} intensity={1.5} />
          <ambientLight intensity={0.5} />

          <Center>
            <Sparkles
              size={sparkles.size}
              count={sparkles.count}
              scale={sparkles.scale}
              position-y={sparkles.positionY}
              speed={sparkles.speed}
              color={sparkleColor}
            />
          </Center>
        </R3FSceneSection>

        {/* <R3FSceneSection name="SectionTwo" count={1}>
          <Float
            position={[0, 0, 0]}
            floatingRange={[0.1, 1]}
            rotation={[Math.PI / 3.5, 0, 0]}
            rotationIntensity={4}
            floatIntensity={0.5}
            speed={0.5}
          >
            <mesh ref={plant1}>
              <boxGeometry args={[28, 28, 28]} />
              <meshBasicMaterial color="orange" />
            </mesh>

          </Float>
        </R3FSceneSection> */}
      </Suspense>
    </>
  );
}

export default Experience;
