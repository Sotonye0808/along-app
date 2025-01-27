/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";

// Add these new interfaces
interface Link {
  id: string;
  url: string;
  text: string;
}

interface RouteContent {
  text: string;
  links: Link[];
}

const ShareRoute = () => {
  const [creatingPost, setCreatingPost] = useState(false);
  const nextIdRef = useRef(3); // Start from 3 since we initialize with 1 and 2
  const [routes, setRoutes] = useState<{ id: number; content: RouteContent }[]>(
    [
      { id: 1, content: { text: "", links: [] } },
      { id: 2, content: { text: "", links: [] } },
    ]
  );

  // New state for active formatting and media
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add new state for storing raw text content
  const [rawContent, setRawContent] = useState<{ [key: number]: string }>({});

  // Add state for cursor position and selection
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRefs = useRef<{ [key: number]: HTMLInputElement }>({});
  const displayRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  const [links, setLinks] = useState<Link[]>([]);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const toggleCreatingPost = () => {
    setCreatingPost(!creatingPost);
  };

  const getSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    return selection.getRangeAt(0);
  };

  const getFormatClasses = (formats: string[]) => {
    return formats
      .map((format) => {
        switch (format) {
          case "bold":
            return "font-bold";
          case "italic":
            return "italic";
          case "underline":
            return "underline";
          case "strikeThrough":
            return "line-through";
          default:
            return "";
        }
      })
      .join(" ");
  };

  const getOppositeFormatClasses = (formats: string[]): string => {
    return formats
      .map(format => {
        switch (format) {
          case 'bold': return 'font-normal';
          case 'italic': return 'not-italic';
          case 'underline': return 'no-underline';
          case 'strikeThrough': return 'no-line-through';
          default: return '';
        }
      })
      .join(' ');
  };

  const getFormatFromElement = (element: HTMLElement): string[] => {
    const formats: string[] = [];
    if (element.classList.contains("font-bold")) formats.push("bold");
    if (element.classList.contains("italic")) formats.push("italic");
    if (element.classList.contains("underline")) formats.push("underline");
    if (element.classList.contains("line-through"))
      formats.push("strikeThrough");
    return formats;
  };

  const handleTextFormat = (format: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
      // Check if selection is already formatted
      const parentSpan = range.commonAncestorContainer.parentElement;
      if (parentSpan?.tagName === "SPAN") {
        const existingFormats = getFormatFromElement(parentSpan);
        if (existingFormats.includes(format)) {
          // Apply opposite format to cancel out existing format
          const span = document.createElement('span');
          span.className = getOppositeFormatClasses([format]);
          range.surroundContents(span);
        } else {
          // Add new format to selection
          const span = document.createElement('span');
          span.className = getFormatClasses([format]);
          range.surroundContents(span);
        }
      } else {
        // Create new formatted span
        const span = document.createElement("span");
        span.className = getFormatClasses([format]);
        range.surroundContents(span);
      }

      // Update the input value with the modified HTML
      const routeId = parseInt(
        range.startContainer.parentElement
          ?.closest("[data-route-id]")
          ?.getAttribute("data-route-id") || "0"
      );
      const displayDiv = displayRefs.current[routeId];
      if (displayDiv) {
        const newText = displayDiv.innerHTML;
        handleRouteChange(routeId, newText, true);
      }
    } else {
      // Toggle format for future typing
      setActiveFormats((prev) =>
        prev.includes(format)
          ? prev.filter((f) => f !== format)
          : [...prev, format]
      );
    }
  };

  const handleRouteChange = (id: number, value: string, isFormatted = false) => {
    const route = routes.find(r => r.id === id);
    if (!route) return;

    // Don't prevent typing in non-first routes
    const isPreviousRouteEmpty = id > 1 && routes[id - 2].content.text.trim() === '';
    if (isPreviousRouteEmpty) return;

    let newValue = value;
    if (!isFormatted && activeFormats.length > 0) {
      // Get the difference between old and new text
      const oldText = route.content.text.replace(/<[^>]*>/g, '');
      const newText = value;
      
      if (newText.length > oldText.length) {
        // Text was added
        const addedText = newText.slice(oldText.length);
        newValue = route.content.text + `<span class="${getFormatClasses(activeFormats)}">${addedText}</span>`;
      } else {
        // Text was removed
        const remainingText = newText;
        // Find all formatted spans and reconstruct with remaining text
        const spans = route.content.text.match(/<span class="[^"]*">[^<]*<\/span>/g) || [];
        // eslint-disable-next-line prefer-const
        let plainText = route.content.text.replace(/<[^>]*>/g, '');
        
        newValue = '';
        let currentPos = 0;
        
        spans.forEach(span => {
          const spanText = span.match(/>([^<]*)</)?.[1] || '';
          const spanPos = plainText.indexOf(spanText);
          if (spanPos >= 0 && currentPos <= spanPos && spanPos + spanText.length <= remainingText.length) {
            // Add any unformatted text before this span
            if (spanPos > currentPos) {
              newValue += remainingText.slice(currentPos, spanPos);
            }
            // Add the span if its text is still present
            newValue += span;
            currentPos = spanPos + spanText.length;
          }
        });
        
        // Add any remaining unformatted text
        if (currentPos < remainingText.length) {
          newValue += remainingText.slice(currentPos);
        }
      }
    }

    const updatedRoutes = routes.map(route =>
      route.id === id
        ? { ...route, content: { ...route.content, text: newValue } }
        : route
    );

    setRoutes(updatedRoutes);

    // Update cursor position correctly
    requestAnimationFrame(() => {
      const input = inputRefs.current[id];
      if (input) {
        const pos = value.length;
        input.setSelectionRange(pos, pos);
        input.focus();
      }
    });

    // Add new input logic
    if (id === routes[routes.length - 1].id && value.trim().length > 0) {
      const allPreviousHaveValue = routes.every(
        (route, index) =>
          index === routes.length - 1 || route.content.text.trim() !== ""
      );

      if (allPreviousHaveValue) {
        setRoutes([
          ...updatedRoutes,
          {
            id: nextIdRef.current,
            content: { text: "", links: [] },
          },
        ]);
        nextIdRef.current += 1;
      }
    }
  };

  const handleSelectionChange = (id: number, start: number, end: number) => {
    setSelection({ start, end });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLinkAdd = () => {
    const url = prompt("Enter URL:");
    const text = prompt("Enter link text:");
    if (url && text) {
      const newLink = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        text,
      };
      setLinks((prev) => [...prev, newLink]);
    }
  };

  const removeLink = (linkId: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  // In the render section, filter routes based on previous route having content
  const visibleRoutes = routes.filter((route, index) => {
    if (index === 0) return true; // Always show first route
    return routes[index - 1].content.text.trim() !== ""; // Show only if previous has content
  });

  return (
    <div className="w-full">
      <div className="hidden p-2 bg-white rounded-xl border md:flex items-center justify-between w-11/12 mr-4">
        <div className="flex items-center" onClick={toggleCreatingPost}>
          <div className="w-9 h-8 rounded-full bg-gray-300 ml-2"></div>
          <input
            type="text"
            placeholder="Share a route..."
            className="rounded-full py-2 px-4 w-full focus:outline-none focus:border-green-500"
          />
        </div>
        <button className="mr-2 bg-alonggreen text-white px-4 py-2 rounded-md">
          Post
        </button>
      </div>
      <button
        type="button"
        onClick={toggleCreatingPost}
        className="flex h-full w-fit justify-center items-center md:hidden text-3xl text-green-700">
        ✍
      </button>
      <div
        id="actual-post-creation"
        className={`fixed top-0 right-0 z-30 w-screen h-screen bg-gray-900 bg-opacity-90 flex justify-center items-center ${
          creatingPost ? "" : "hidden"
        }`}>
        <div className="w-5/6 md:w-8/12 rounded-xl p-4 bg-gray-100 relative flex flex-col gap-4">
          <button
            className="w-full text-right text-2xl text-gray-400 absolute block top-0 right-6 hover:text-gray-800"
            type="button"
            onClick={toggleCreatingPost}>
            x
          </button>
          <form className="mt-8 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="hidden" htmlFor="postTitle"></label>
              <input
                id="postTitle"
                name="postTitle"
                type="text"
                placeholder="Title"
                className="placeholder:font-semibold placeholder:text-gray-500 text-2xl font-semibold bg-transparent focus:outline-none"
              />
              <button
                type="button"
                className="place-self-end rounded-lg p-1 border border-gray-400 text-alonggreen font-semibold text-sm">
                Drafts
              </button>
            </div>
            {/* Add links display section */}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4">
                {links.map((link) => (
                  <span key={link.id} className="link-preview">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer">
                      {link.text}
                    </a>
                    <span
                      className="remove-link"
                      onClick={() => removeLink(link.id)}>
                      ×
                    </span>
                  </span>
                ))}
              </div>
            )}
            <div
              id="route-entries"
              className="flex flex-col gap-8 max-h-[40vh] md:max-h-[50vh] overflow-y-auto px-2">
              {visibleRoutes.map((route, index) => (
                <div key={route.id} className="route-entry flex flex-col">
                  <div className="flex items-center">
                    <div className="profile-pic-placeholder w-9 h-8 rounded-full bg-gray-500 ml-2 shrink-0"></div>
                    <div className="w-full relative input-container">
                      <input
                        ref={(el) => {
                          inputRefs.current[route.id] = el!;
                        }}
                        type="text"
                        value={route.content.text.replace(/<[^>]*>/g, "")}
                        onChange={(e) =>
                          handleRouteChange(route.id, e.target.value)
                        }
                        className="route-input"
                        data-route-id={route.id}
                      />
                      <div
                        ref={(el) => {
                          displayRefs.current[route.id] = el!;
                        }}
                        className="input-renderer"
                        data-placeholder={index === 0 ? "Where we dey go?" : "Where next?"}
                        dangerouslySetInnerHTML={{ __html: route.content.text }}
                      />
                    </div>
                  </div>
                  {index === routes.length - 1 && images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-11">
                      {images.map((img, i) => (
                        <div key={i} className="relative w-20 h-20">
                          <Image
                            src={img.preview}
                            alt="preview"
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div id="actions" className="flex justify-between gap-4 w-full">
              <div className="flex justify-center items-center gap-4">
                <button
                  type="button"
                  className="place-self-end rounded-lg p-1 border border-gray-400 text-alonggreen font-semibold text-xs">
                  # Add tags
                </button>
                <div
                  id="text-editor"
                  className="text-xs text-gray-400 flex justify-center items-center gap-3">
                  {["bold", "underline", "italic", "strikeThrough"].map(
                    (format) => (
                      <span
                        key={format}
                        className={`cursor-pointer hover:text-gray-600 ${
                          activeFormats.includes(format)
                            ? "text-alonggreen"
                            : ""
                        } ${format === "bold" ? "font-bold" : ""} 
                        ${format === "italic" ? "italic" : ""} 
                        ${format === "underline" ? "underline" : ""} 
                        ${format === "strikeThrough" ? "line-through" : ""}`}
                        onClick={() => handleTextFormat(format)}>
                        {format.charAt(0).toUpperCase()}
                      </span>
                    )
                  )}
                  <input
                    id="fileInput"
                    title="Upload Image(s)"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <span
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>
                    <Image
                      src="/icons/image.svg"
                      alt="image icon"
                      width={12}
                      height={12}
                    />
                  </span>
                  <span className="cursor-pointer" onClick={handleLinkAdd}>
                    <Image
                      src="/icons/link.svg"
                      alt="link icon"
                      width={12}
                      height={12}
                    />
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="mr-2 hover:bg-opacity-85 bg-alonggreen text-white text-sm px-2 py-1 rounded-md">
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareRoute;
