import { smoothStream, streamText } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const model3dDocumentHandler = createDocumentHandler<"model3d">({
  kind: "model3d",
  onCreateDocument: async ({ title, dataStream, modelId }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: getLanguageModel(modelId),
      system:
        "You are a 3D model generator. Generate ONLY valid JavaScript code that uses THREE.js to create geometry.\n\n" +
        "Rules:\n" +
        "- DO NOT use import/export statements. The THREE object is already available globally.\n" +
        "- Use the function `addToScene(geometry, material)` to add objects to the scene.\n" +
        "- `addToScene` accepts: geometry (THREE.BufferGeometry) and optional material (THREE.Material).\n" +
        "- If no material is provided, a default material with color #8888ff will be used.\n" +
        "- Available geometry types: BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, TorusGeometry, TorusKnotGeometry, IcosahedronGeometry, DodecahedronGeometry, OctahedronGeometry, TetrahedronGeometry, RingGeometry, PlaneGeometry, CircleGeometry, LatheGeometry, ExtrudeGeometry (via Shape), TubeGeometry (via Curve), BufferGeometry (custom).\n" +
        "- Available materials: MeshStandardMaterial, MeshPhongMaterial, MeshBasicMaterial, MeshLambertMaterial, MeshMatcapMaterial.\n" +
        "- Use `Math.PI` for PI, `Math.sin`, `Math.cos` for math.\n" +
        "- Position objects by setting `.position.set(x, y, z)` on the mesh returned by addToScene.\n" +
        "- Scale objects by setting `.scale.set(x, y, z)`.\n" +
        "- Rotate objects by setting `.rotation.x`, `.rotation.y`, `.rotation.z` (in radians).\n" +
        "- Group multiple objects using `const group = new THREE.Group(); addToScene(group);`. Then add meshes to the group.\n" +
        "- Use `THREE.Shape` and `THREE.ExtrudeGeometry` for extruded 2D shapes.\n" +
        "- Use `THREE.Shape` and `THREE.LatheGeometry` for lathe/revolved shapes.\n" +
        "- Use `THREE.CatmullRomCurve3` and `THREE.TubeGeometry` for tube/path extrusions.\n" +
        "- Keep the model centered at world origin.\n" +
        "- Make the model reasonably sized (between 0.5 and 5 units).\n" +
        "- Add multiple colors/materials for visual appeal.\n" +
        "Output ONLY the raw JavaScript code. No markdown fences, no explanations, no imports.",
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        draftContent += delta.text;
        dataStream.write({
          type: "data-model3dDelta",
          data: draftContent,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, modelId }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: getLanguageModel(modelId),
      system:
        "You are a 3D model generator. Modify the existing THREE.js code to implement the requested changes.\n" +
        "Output ONLY the complete updated JavaScript code. No markdown fences, no explanations.\n" +
        "Same rules as creation: use addToScene(geometry, material), THREE is global, no imports.\n\n" +
        "Current code:\n" +
        document.content,
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: description,
    });

    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        draftContent += delta.text;
        dataStream.write({
          type: "data-model3dDelta",
          data: draftContent,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});
