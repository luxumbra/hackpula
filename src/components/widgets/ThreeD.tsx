import { Canvas } from '@react-three/fiber';
import { lazy } from 'react';
const Experience = lazy(() => import('~/components/widgets/Experience'));

// const root = ReactDOM.createRoot(document.querySelector('#root'))

const ThreeD = () => {
  // const isMobile = /iPhone|iPad|iPo/d|Android/i.test(navigator.userAgent)

  return (
    <div className="fixed top-0 left-0 w-screen h-full z-[2] pointer-events-none">
      <Canvas className="fixed top-0 left-0 w-screen h-full pointer-events-none bg-secondary-dark">
        <Experience />
      </Canvas>
    </div>
  );
};

export default ThreeD;
