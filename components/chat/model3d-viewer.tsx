"use client";

import { Center, Html, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as THREE from "three";
import { DocumentSkeleton } from "./document-skeleton";
import { ChevronDownIcon, ChevronRightIcon } from "./icons";

type Model3dViewerProps = {
  content: string;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  onSaveContent: (content: string, debounce: boolean) => void;
  isLoading: boolean;
  metadata: Record<string, unknown> | null;
};

function SceneContent({ code }: { code: string }) {
  const { scene } = useThree();
  const groupRef = useRef<THREE.Group>(new THREE.Group());
  const [hasContent, setHasContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ("geometry" in child) {
        (child as THREE.Mesh).geometry.dispose();
      }
      if ("material" in child) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            m.dispose();
          });
        } else {
          mat.dispose();
        }
      }
    }
    scene.remove(group);
    scene.add(group);

    if (!code || code.trim().length === 0) {
      setHasContent(false);
      setError(null);
      return;
    }

    setError(null);
    setHasContent(true);

    try {
      const defaultMat = new THREE.MeshStandardMaterial({
        color: 0x8888ff,
        roughness: 0.4,
        metalness: 0.3,
      });

      const addToScene = (
        geometryOrGroup: THREE.BufferGeometry | THREE.Group | THREE.Mesh,
        material?: THREE.Material
      ) => {
        if (geometryOrGroup instanceof THREE.Group) {
          group.add(geometryOrGroup);
          return geometryOrGroup;
        }
        if (geometryOrGroup instanceof THREE.Mesh) {
          group.add(geometryOrGroup);
          return geometryOrGroup;
        }
        const mesh = new THREE.Mesh(geometryOrGroup, material || defaultMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        return mesh;
      };

      const THREE_CTX = { ...THREE, addToScene };
      const paramNames = Object.keys(THREE_CTX);
      const paramValues = Object.values(THREE_CTX);
      const fn = new Function(...paramNames, code);
      fn(...paramValues);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setHasContent(false);
    }

    return () => {
      scene.remove(group);
    };
  }, [code, scene]);

  const meshCount = groupRef.current.children.length;

  useFrame((_, delta) => {
    if (groupRef.current.children.length > 0) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  if (error) {
    return (
      <Center>
        <Html>
          <div className="rounded-lg bg-red-500/10 p-4 text-center text-sm text-red-500">
            Error: {error}
          </div>
        </Html>
      </Center>
    );
  }

  if (!hasContent || meshCount === 0) {
    return (
      <>
        <ambientLight intensity={0.6} />
        <Center>
          <group>
            <Text fontSize={0.3} color="#888" position={[0, 0.5, 0]}>
              Generating model...
            </Text>
            <mesh>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#444" wireframe />
            </mesh>
          </group>
        </Center>
        <OrbitControls enablePan enableZoom enableRotate />
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.2} />
      <primitive object={groupRef.current} />
      <OrbitControls enablePan enableZoom enableRotate autoRotate={false} />
    </>
  );
}

export const Model3DViewer = ({
  content,
  status,
  isLoading,
  metadata,
}: Model3dViewerProps) => {
  const [codeOpen, setCodeOpen] = useState(false);
  void metadata;

  const handleDownloadStl = useCallback(() => {
    toast.error("STL export requires the Docker Blender backend. Coming soon.");
  }, []);

  const handleDownloadObj = useCallback(() => {
    toast.error("OBJ export requires the Docker Blender backend. Coming soon.");
  }, []);

  if (isLoading) {
    return <DocumentSkeleton artifactKind="code" />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex flex-1">
        <Canvas
          shadows
          camera={{ position: [3, 2, 5], fov: 45 }}
          className="h-full w-full"
          gl={{ antialias: true }}
        >
          <SceneContent code={content} />
        </Canvas>

        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={handleDownloadStl}
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm border border-border transition-colors hover:bg-accent disabled:opacity-40"
            aria-label="Download STL"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            STL
          </button>
          <button
            type="button"
            onClick={handleDownloadObj}
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm border border-border transition-colors hover:bg-accent disabled:opacity-40"
            aria-label="Download OBJ"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            OBJ
          </button>
        </div>
      </div>

      <div className="shrink-0">
        <button
          type="button"
          onClick={() => setCodeOpen(!codeOpen)}
          className="flex w-full items-center gap-2 border-t border-border/50 px-4 py-2 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          {codeOpen ? (
            <ChevronDownIcon size={14} />
          ) : (
            <ChevronRightIcon size={14} />
          )}
          <span className="font-medium">Code</span>
          {status === "streaming" && (
            <div className="size-1.5 animate-pulse rounded-full bg-blue-500" />
          )}
          {content && (
            <span className="text-muted-foreground/50">
              ({content.split("\n").length} lines)
            </span>
          )}
        </button>

        {codeOpen && content && (
          <pre className="max-h-[180px] overflow-auto border-t border-border/50 bg-muted/30 p-3 text-xs leading-relaxed">
            <code>
              {content.split("\n").map((line, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                <span key={i} className="block">
                  <span className="mr-3 inline-block w-6 text-right text-muted-foreground/30 select-none">
                    {i + 1}
                  </span>
                  {line || "\u00A0"}
                </span>
              ))}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
};
