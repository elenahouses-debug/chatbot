import { toast } from "sonner";
import { Artifact } from "@/components/chat/create-artifact";
import { CopyIcon, RedoIcon, UndoIcon } from "@/components/chat/icons";
import { Model3DViewer } from "@/components/chat/model3d-viewer";

type Model3dMetadata = {
  previewImage: string | null;
  stlFile: string | null;
  objFile: string | null;
};

export const model3dArtifact = new Artifact<"model3d", Model3dMetadata>({
  kind: "model3d",
  description:
    "Useful for 3D model generation and 3D printing file export (STL/OBJ). Uses Blender Python scripts.",
  initialize: ({ setMetadata }) => {
    setMetadata({
      previewImage: null,
      stlFile: null,
      objFile: null,
    });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-model3dDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 200 &&
          draftArtifact.content.length < 250
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  content: Model3DViewer,
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy code to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [],
});
