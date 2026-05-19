"use client";

import { Center, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Group, Mesh, Object3D } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { DocumentSkeleton } from "./document-skeleton";

type Model3dViewerProps = {
  content: string;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  onSaveContent: (content: string, debounce: boolean) => void;
  isLoading: boolean;
  metadata: {
    previewImage?: string | null;
    stlFile?: string | null;
    objFile?: string | null;
  } | null;
};

const ViewerScene = ({
  url,
  format,
}: {
  url: string;
  format: "stl" | "obj";
}) => {
  const groupRef = useRef<Group>(null);
  const [object, setObject] = useState<Object3D | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        let loadedObject: Object3D;
        if (format === "stl") {
          const geometry = await new STLLoader().loadAsync(url);
          const { Mesh: ThreeMesh, MeshStandardMaterial } = await import(
            "three"
          );
          const mesh = new ThreeMesh(
            geometry,
            new MeshStandardMaterial({
              color: 0x8888ff,
              metalness: 0.3,
              roughness: 0.4,
              flatShading: false,
            })
          );
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          loadedObject = mesh;
        } else {
          const obj = await new OBJLoader().loadAsync(url);
          obj.traverse((child) => {
            if ((child as Mesh).isMesh) {
              const mesh = child as Mesh;
              mesh.material = Array.isArray(mesh.material)
                ? mesh.material[0]
                : mesh.material;
              if (mesh.material) {
                (mesh.material as any).color = { r: 0.53, g: 0.53, b: 1 };
                (mesh.material as any).metalness = 0.3;
                (mesh.material as any).roughness = 0.4;
              }
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          loadedObject = obj;
        }

        if (!cancelled) {
          setObject(loadedObject);
        }
      } catch {
        if (!cancelled) {
          setObject(null);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [url, format]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  if (!object) {
    return null;
  }

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={object} />
      </group>
    </Center>
  );
};

const PlaceholderScene = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      <Center>
        <Text fontSize={0.3} color="#888" position={[0, 0.5, 0]}>
          3D Model
        </Text>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#444" wireframe />
        </mesh>
      </Center>
      <OrbitControls enablePan enableZoom enableRotate />
    </>
  );
};

const Model3DPreview = ({
  metadata,
}: {
  metadata: Model3dViewerProps["metadata"];
}) => {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerFormat, setViewerFormat] = useState<"stl" | "obj" | null>(null);

  useEffect(() => {
    if (metadata?.stlFile) {
      setViewerUrl(metadata.stlFile);
      setViewerFormat("stl");
    } else if (metadata?.objFile) {
      setViewerUrl(metadata.objFile);
      setViewerFormat("obj");
    } else {
      setViewerUrl(null);
      setViewerFormat(null);
    }
  }, [metadata]);

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border bg-gradient-to-b from-background to-muted/30">
      <Canvas
        shadows
        camera={{ position: [3, 2, 5], fov: 45 }}
        className="h-full w-full"
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />

        {viewerUrl && viewerFormat ? (
          <>
            <ViewerScene url={viewerUrl} format={viewerFormat} />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              autoRotate={false}
            />
          </>
        ) : (
          <PlaceholderScene />
        )}
      </Canvas>

      {metadata?.previewImage && !viewerUrl && (
        <Image
          src={metadata.previewImage}
          alt="3D Preview"
          fill
          className="object-contain"
        />
      )}
    </div>
  );
};

const CodePreview = ({
  content,
  status,
}: {
  content: string;
  status: "streaming" | "idle";
}) => {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Blender Python Code
        </h3>
        {status === "streaming" && (
          <div className="size-1.5 animate-pulse rounded-full bg-blue-500" />
        )}
      </div>
      <pre className="max-h-[300px] overflow-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
        <code>
          {content.split("\n").map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: line number is stable key
            <span key={i} className="block">
              <span className="mr-4 inline-block w-8 text-right text-muted-foreground/40 select-none">
                {i + 1}
              </span>
              {line || "\u00A0"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};

export const Model3DViewer = ({
  content,
  status,
  isLoading,
  metadata,
}: Model3dViewerProps) => {
  const handleDownloadStl = useCallback(() => {
    if (metadata?.stlFile) {
      const a = document.createElement("a");
      a.href = metadata.stlFile;
      a.download = "model.stl";
      a.click();
    } else {
      toast.error("STL file not available yet. Generate the model first.");
    }
  }, [metadata]);

  const handleDownloadObj = useCallback(() => {
    if (metadata?.objFile) {
      const a = document.createElement("a");
      a.href = metadata.objFile;
      a.download = "model.obj";
      a.click();
    } else {
      toast.error("OBJ file not available yet. Generate the model first.");
    }
  }, [metadata]);

  if (isLoading) {
    return <DocumentSkeleton artifactKind="code" />;
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <Model3DPreview metadata={metadata} />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownloadStl}
          disabled={!metadata?.stlFile}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Download STL file"
        >
          <svg
            width="16"
            height="16"
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
          Download STL
        </button>

        <button
          type="button"
          onClick={handleDownloadObj}
          disabled={!metadata?.objFile}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Download OBJ file"
        >
          <svg
            width="16"
            height="16"
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
          Download OBJ
        </button>
      </div>

      {content && <CodePreview content={content} status={status} />}
    </div>
  );
};
