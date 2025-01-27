/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";

const ShareRoute = () => {
  const [creatingPost, setCreatingPost] = useState(false);
  const nextIdRef = useRef(3); // Start from 3 since we initialize with 1 and 2
  const [routes, setRoutes] = useState([
    { id: 1, value: "" },
    { id: 2, value: "" },
  ]);

  // New state for active formatting and media
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add new state for storing raw text content
  const [rawContent, setRawContent] = useState<{ [key: number]: string }>({});

  // Add state for cursor position and selection
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRefs = useRef<{ [key: number]: HTMLInputElement }>({});
  const displayRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  const toggleCreatingPost = () => {
    setCreatingPost(!creatingPost);
  };

  const getSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    return selection.getRangeAt(0);
  };

  const applyFormatToSelection = (format: string) => {
    const selection = getSelection();
    if (!selection) return;

    const element = selection.commonAncestorContainer.parentElement;
    if (!element) return;

    const routeId = parseInt(element.getAttribute('data-route-id') || '0');
    const range = selection.cloneRange();
    
    let tag = '';
    switch (format) {
      case 'bold': tag = 'strong'; break;
      case 'italic': tag = 'em'; break;
      case 'underline': tag = 'u'; break;
      case 'strikeThrough': tag = 's'; break;
    }

    const wrapper = document.createElement(tag);
    range.surroundContents(wrapper);
    
    // Update content in state
    const updatedContent = element.innerHTML;
    setRawContent(prev => ({ ...prev, [routeId]: updatedContent }));
    handleRouteChange(routeId, updatedContent, element);
  };

  const handleTextFormat = useCallback((format: string) => {
    setActiveFormats(prev => {
      const newFormats = new Set(prev);
      if (newFormats.has(format)) {
        newFormats.delete(format);
      } else {
        newFormats.add(format);
      }
      return newFormats;
    });
    applyFormatToSelection(format);
  }, []);

  const formatText = (text: string, formats: Set<string>): string => {
    const formattedText = text;
    let classes = '';
    
    if (formats.has('bold')) classes += 'font-bold ';
    if (formats.has('italic')) classes += 'italic ';
    if (formats.has('underline')) classes += 'underline ';
    if (formats.has('strikeThrough')) classes += 'line-through ';
    
    return classes ? `<span class="${classes.trim()}">${formattedText}</span>` : formattedText;
  };

  const syncScroll = (id: number, e: React.UIEvent<HTMLInputElement>) => {
    const displayElement = displayRefs.current[id];
    if (displayElement) {
      displayElement.scrollTop = e.currentTarget.scrollTop;
      displayElement.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleRouteChange = (id: number, value: string, element?: HTMLElement) => {
    const displayElement = displayRefs.current[id];
    
    // Store raw HTML content
    setRawContent(prev => ({ ...prev, [id]: value }));
    
    // Update routes state with plain text
    const plainText = value.replace(/<[^>]*>/g, '');
    const updatedRoutes = routes.map(route =>
      route.id === id ? { ...route, value: plainText } : route
    );

    // If a route is emptied, remove all subsequent routes
    if (!value) {
      const currentIndex = routes.findIndex((route) => route.id === id);
      if (currentIndex >= 1) {
        // Allow first route to be empty
        const filteredRoutes = updatedRoutes.filter(
          (_, index) => index <= currentIndex
        );
        setRoutes(filteredRoutes);
        return;
      }
    }

    setRoutes(updatedRoutes);

    // Add new input only if typing in last input AND all previous routes have values
    if (id === routes[routes.length - 1].id && value.length > 0) {
      const allPreviousHaveValue = routes.every(
        (route, index) =>
          index === routes.length - 1 || route.value.trim() !== ""
      );

      if (allPreviousHaveValue) {
        setRoutes([...updatedRoutes, { id: nextIdRef.current, value: "" }]);
        nextIdRef.current += 1;
      }
    }

    // Restore cursor position
    requestAnimationFrame(() => {
      const inputElement = inputRefs.current[id];
      if (inputElement) {
        inputElement.setSelectionRange(selection.start, selection.end);
        inputElement.focus();
      }
    });
  };

  const handleSelectionChange = (id: number, start: number, end: number) => {
    setSelection({ start, end });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLinkAdd = () => {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text:');
    if (url && text) {
      const linkMd = `[${text}](${url})`;
      // Insert at current route's cursor position or append to last route
      const lastRoute = routes[routes.length - 1];
      handleRouteChange(lastRoute.id, lastRoute.value + ' ' + linkMd, document.createElement('div'));
    }
  };

  // In the render section, filter routes based on previous route having content
  const visibleRoutes = routes.filter((route, index) => {
    if (index === 0) return true; // Always show first route
    return routes[index - 1].value.trim() !== ""; // Show only if previous has content
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
            <div
              id="route-entries"
              className="flex flex-col gap-8 max-h-[40vh] md:max-h-[50vh] overflow-y-auto px-2">
              {visibleRoutes.map((route, index) => (
                <div key={route.id} className="route-entry flex flex-col">
                  <div className="flex items-center">
                    <div className="profile-pic-placeholder w-9 h-8 rounded-full bg-gray-500 ml-2 shrink-0"></div>
                    <div className="w-full">
                      <div className="input-container rounded-lg focus-within:border focus-within:border-green-500">
                        <input
                          ref={el => { inputRefs.current[route.id] = el!; }}
                          type="text"
                          value={routes.find(r => r.id === route.id)?.value || ''}
                          onChange={(e) => handleRouteChange(route.id, e.target.value)}
                          onScroll={(e) => syncScroll(route.id, e)}
                          onSelect={(e) => handleSelectionChange(
                            route.id,
                            e.currentTarget.selectionStart ?? 0,
                            e.currentTarget.selectionEnd ?? 0
                          )}
                          className="route-input"
                        />
                        <div
                          ref={el => { displayRefs.current[route.id] = el!; }}
                          className="input-renderer"
                          dangerouslySetInnerHTML={{ 
                            __html: rawContent[route.id] || ''
                          }}
                        />
                        {(!rawContent[route.id] || rawContent[route.id].length === 0) && (
                          <div className="input-placeholder">
                            {index === 0 ? "Where we dey go?" : "Where next?"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {index === routes.length - 1 && images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-11">
                      {images.map((img, i) => (
                        <div key={i} className="relative w-20 h-20">
                          <Image src={img.preview} alt="preview" layout="fill" objectFit="cover" className="rounded" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                          >
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
                  <span
                    className={`font-bold cursor-pointer hover:text-gray-600 ${activeFormats.has('bold') ? 'text-alonggreen' : ''}`}
                    onClick={() => handleTextFormat("bold")}>
                    B
                  </span>
                  <span
                    className={`underline cursor-pointer hover:text-gray-600 ${activeFormats.has('underline') ? 'text-alonggreen' : ''}`}
                    onClick={() => handleTextFormat("underline")}>
                    U
                  </span>
                  <span
                    className={`italic cursor-pointer hover:text-gray-600 ${activeFormats.has('italic') ? 'text-alonggreen' : ''}`}
                    onClick={() => handleTextFormat("italic")}>
                    I
                  </span>
                  <span
                    className={`line-through cursor-pointer hover:text-gray-600 ${activeFormats.has('strikeThrough') ? 'text-alonggreen' : ''}`}
                    onClick={() => handleTextFormat("strikeThrough")}>
                    S
                  </span>
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
                  <span className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Image src="/icons/image.svg" alt="image icon" width={12} height={12} />
                  </span>
                  <span className="cursor-pointer" onClick={handleLinkAdd}>
                    <Image src="/icons/link.svg" alt="link icon" width={12} height={12} />
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
