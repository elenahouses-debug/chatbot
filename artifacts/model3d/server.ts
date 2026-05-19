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
        "You are an expert Blender Python artist. Generate ONLY valid Python code for Blender 4.x that creates the described 3D model. Use bpy and bmesh. Always include:\n" +
        "- import bpy, bmesh, math\n" +
        "- Clear the scene: bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)\n" +
        "- Add materials and colors where appropriate\n" +
        "- Smooth surfaces with bpy.ops.object.shade_smooth()\n" +
        "- Center the model at world origin\n" +
        "Output ONLY the raw Python code. No markdown fences, no explanations.",
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
        "You are an expert Blender Python artist. Modify the existing script to implement the requested changes.\n" +
        "Output ONLY the complete updated Python code. No markdown fences, no explanations.\n\n" +
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
