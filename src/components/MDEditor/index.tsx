import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { EditorState, convertToRaw, ContentState, Modifier } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import MDEditorRoot from "components/MDEditor/MDEditorRoot";
import { useMaterialUIController } from "context";
import axiosInstance from "utils/axiosInstance";
import { toast } from "react-toastify";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { getImageUrl } from "utils/apiConfig";
import { getErrorMessage } from "utils/errors";
import { MAX_IMAGE_SIZE, MAX_IMAGE_SIZE_MB } from "constants/index";

// Upload one image and return its public URL
const uploadImage = async (file: Blob, name?: string): Promise<string> => {
  const formData = new FormData();
  if (name) formData.append("file", file, name);
  else formData.append("file", file);
  const response = await axiosInstance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return getImageUrl(response?.data?.fileName);
};

// Decoded by hand (not fetch) so a Content-Security-Policy can't block it
const dataUrlToBlob = (dataUrl: string): Blob => {
  const [meta, data = ""] = dataUrl.split(",");
  const type = meta.match(/^data:([^;,]+)/)?.[1] || "";
  const bytes = meta.includes(";base64") ? atob(data) : decodeURIComponent(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type });
};

// HTML pasted from Word/Docs/web carries images as base64 data: URLs, which made the
// article too large for the API (413). Upload them and keep links instead.
const uploadPastedImages = async (html: string): Promise<string> => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const images = Array.from(doc.querySelectorAll<HTMLImageElement>('img[src^="data:"]'));
  let dropped = 0;
  await Promise.all(
    images.map(async (img, i) => {
      try {
        const blob = dataUrlToBlob(img.getAttribute("src") || "");
        if (!blob.type.startsWith("image/") || blob.size > MAX_IMAGE_SIZE) {
          throw new Error("unsupported pasted image");
        }
        const ext = blob.type.split("/")[1].replace("jpeg", "jpg").replace("svg+xml", "svg");
        img.setAttribute("src", await uploadImage(blob, `pasted-${i + 1}.${ext}`));
      } catch {
        img.remove();
        dropped += 1;
      }
    })
  );
  if (dropped) {
    toast.warning(
      `${dropped} pasted image${dropped > 1 ? "s" : ""} couldn't be added ` +
        `(max ${MAX_IMAGE_SIZE_MB}MB, JPG/PNG/WebP/SVG). Use the image button to add them.`
    );
  }
  return doc.body.innerHTML;
};

// Insert pasted HTML at the current selection
const insertHtml = (state: EditorState, html: string): EditorState => {
  const contentBlock = htmlToDraft(`<p></p>${html}<p></p>`);
  if (!contentBlock) return state;
  const newContentState = ContentState.createFromBlockArray(
    contentBlock.contentBlocks,
    contentBlock.entityMap
  );
  const mergedContentState = Modifier.replaceWithFragment(
    state.getCurrentContent(),
    state.getSelection(),
    newContentState.getBlockMap()
  );
  return EditorState.push(state, mergedContentState, "insert-characters");
};

function MDEditor({
  value,
  onChange,
  disabled = false,
  noBorder = false,
}: {
  value: any;
  onChange: any;
  disabled?: any;
  noBorder?: boolean;
}) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [editorState, setEditorState] = React.useState(() => {
    const contentBlock = value ? htmlToDraft(value) : null;
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  const uploadCallback = (file: any) => {
    return new Promise((resolve, reject) => {
      if (file?.size > MAX_IMAGE_SIZE) {
        toast.error(`Image is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`);
        reject(new Error("file too large"));
        return;
      }
      uploadImage(file)
        .then((link) => {
          resolve({
            data: { link },
          });
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          toast.error(getErrorMessage(error, "Could not upload the image. Please try again."));
          reject(error);
        });
    });
  };

  const config = {
    blockType: {
      inDropdown: true,
      options: ["Normal", "H1", "H2", "H3", "H4", "H5", "H6", "Blockquote"],
    },
    image: {
      uploadCallback: uploadCallback,
      previewImage: true,
      alignmentEnabled: false,
      alt: { present: true, mandatory: true },
      inputAccept: "image/jpeg,image/jpg,image/png,image/svg",
    },
  };
  const handlePastedText = (
    text: string,
    html: string | undefined,
    editorState: EditorState,
    onChange: (editorState: EditorState) => void
  ): boolean => {
    if (!html) return false;
    if (/<img[^>]+src\s*=\s*["']?data:/i.test(html)) {
      // Upload embedded images first, then insert at the (current) cursor
      const toastId = toast.info("Uploading pasted images…", { autoClose: false });
      uploadPastedImages(html)
        .then((cleanHtml) => setEditorState((current) => insertHtml(current, cleanHtml)))
        .finally(() => toast.dismiss(toastId));
      return true;
    }
    onChange(insertHtml(editorState, html));
    return true;
  };

  useEffect(() => {
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    onChange(html);
  }, [editorState]);

  return (
    <MDEditorRoot ownerState={{ darkMode }}>
      <Editor
        readOnly={disabled}
        editorClassName={noBorder ? "noBorder-editor-main" : "editorClassName"}
        toolbarHidden={disabled}
        // Read-only display (preview, share page, report) is as tall as its text
        editorStyle={{ minHeight: noBorder ? 0 : "352px" }}
        toolbar={config}
        editorState={editorState}
        onEditorStateChange={setEditorState}
        wrapperClassName={noBorder && "noBorder-editor-wrapper"}
        handlePastedText={handlePastedText}
      />
    </MDEditorRoot>
  );
}

// Typechecking props for the MDEditor
MDEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default MDEditor;
