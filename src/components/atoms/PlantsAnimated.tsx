import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useAnimationFrame } from 'framer-motion';

export const PlantsAnimated = (children: ReactNode) => {
  const plantsWrapper = useRef<HTMLDivElement>(null);
  const animatedWrapper = plantsWrapper.current;
  const plants = animatedWrapper.querySelector('.plant svg');
  const particles = plants.querySelectorAll('g > circle');

  useAnimationFrame((time, delta) => {
    // console.log(time, delta);
    // console.log(particles);
    particles.forEach((particle, index) => {
      const x = Math.sin((time + index * 10) / 1000) * 20;
      const y = Math.cos((time + index * 10) / 1000) * 20;
      particle.setAttribute('transform', `translate(${x}, ${y})`);
    });
  });

  return <div ref={plantsWrapper}>{children}</div>;
};
