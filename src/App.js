import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  PresentationControls,
  OrbitControls,
  useGLTF,
  Stage,
  softShadows,
  Plane,
  PerspectiveCamera,
  Environment,
  Reflector,
  useTexture,
} from "@react-three/drei";

import Room from "./components/Room-compressed";

import "./app.css";

function App() {
  const controls = useRef();
  const lightRef = useRef();

  // console.log(nodes);

  return (
    <Canvas dpr={[1, 2]} shadows>
      <color attach="background" args={["#ebebeb"]} />
      <Environment preset="apartment" />
      <group position={[0, -0.5, 0]}>
        <Room scale={0.013} position={[0, 0.45, 0]} />
        <Ground />
        <ContactShadows
          position={[0, -1.7, 0]}
          frames={1}
          far={2.2}
          blur={3}
          // width={3}
          // height={3}
          opacity={0.5}
        />
      </group>
      <OrbitControls
        makeDefault
        // autoRotate
        // autoRotateSpeed={0.3}
        // maxPolarAngle={Math.PI / 2.3}
        // minPolarAngle={Math.PI / 2.3}
        enableZoom={false}
        enablePan={false}
      />
      <Camera lightRef={lightRef} />
    </Canvas>
  );

  function Ground() {
    return (
      <group position={[0, -1.71, 0]}>
        <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial transparent color="black" opacity={0.4} />
        </mesh>
      </group>
    );
  }

  function Camera() {
    const lightRef = useRef();
    // useShadowHelper(lightRef);

    return (
      <group>
        <directionalLight
          ref={lightRef}
          position={[10, 10, 5]}
          angle={0.15}
          penumbra={1}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          visible={true}
        />
        <PerspectiveCamera
          makeDefault
          fov={65}
          position={[0, 0, 5]}
        ></PerspectiveCamera>
      </group>
    );
  }

  // return (
  //   <div className="app">
  //     <Canvas>
  //       <ambientLight intensity={0.2} />
  //       <directionalLight color="white" position={[-50, -30, 50]} />

  //       <PresentationControls global polar={[0, Math.PI / 8]}>
  //         <Stage
  //           contactShadow={false}
  //           adjustCamera
  //           intensity={0.6}
  //           // environment="apartment"
  //           preset="rembrandt"
  //           // controls={controls}
  //         >
  //           <primitive object={scene} scale={[0.013, 0.013, 0.013]} />
  //         </Stage>
  //         <ContactShadows
  //           position={[0, 0, 0]}
  //           frames={1}
  //           far={2.2}
  //           blur={3}
  //           // width={3}
  //           // height={3}
  //           opacity={0.5}
  //         />
  //       </PresentationControls>
  //     </Canvas>
  //   </div>
  // );
}

// function Scene(props) {
//   const group = useRef();
//   const { nodes, scene } = useGLTF("./models/room.glb");

//   return (
//     <group ref={group} {...props} dispose={null}>
//       <mesh
//         castShadow
//         receiveShadow
//         geometry={nodes.Node_0.geometry}
//         material={nodes.Node_0.material}
//       />
//       {/* <primitive
//         object={scene}
//         castShadow
//         receiveShadow
//         scale={[0.013, 0.013, 0.013]}
//         position={[0, 0, 0]}
//       /> */}
//     </group>
//   );
// }

// useGLTF.preload("./models/room.glb");

export default App;
