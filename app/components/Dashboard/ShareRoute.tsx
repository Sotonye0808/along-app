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

  const toggleCreatingPost = () => {
    setCreatingPost(!creatingPost);
  };

  const getSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    return selection.getRangeAt(0);
  };

  const formatTextInRealTime = (text: string): string => {
    // Replace markdown patterns with HTML, being careful with cursor position
    // eslint-disable-next-line prefer-const
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
      .replace(/__(.*?)__/g, '<span class="underline">$1</span>')
      .replace(/~~(.*?)~~/g, '<span class="line-through">$1</span>');
    
    return formattedText;
  };

  const handleRouteChange = (id: number, value: string, element: HTMLElement) => {
    const selection = window.getSelection();
    const cursorPosition = selection?.getRangeAt(0).startOffset || 0;
    
    // Store the raw text (with markdown syntax) in routes
    const updatedRoutes = routes.map((route) =>
      route.id === id ? { ...route, value } : route
    );

    // Store the formatted HTML in rawContent for display
    const formattedValue = formatTextInRealTime(value);
    setRawContent(prev => ({ ...prev, [id]: formattedValue }));

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
      const range = document.createRange();
      const sel = window.getSelection();
      
      if (element.firstChild) {
        const position = Math.min(cursorPosition, element.textContent?.length || 0);
        range.setStart(element.firstChild, position);
        range.setEnd(element.firstChild, position);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
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

  const handleFormatHelp = () => {
    alert(
      'Text Formatting Guide:\n' +
      '**text** for bold\n' +
      '*text* for italic\n' +
      '__text__ for underline\n' +
      '~~text~~ for strikethrough'
    );
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
                    <div className="w-full relative">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        data-route-id={route.id}
                        onInput={(e) => handleRouteChange(route.id, e.currentTarget.textContent || '', e.currentTarget)}
                        className="rounded-lg py-2 px-4 w-full bg-transparent focus:outline-none focus:border-r focus:border-y focus:border-green-500 min-h-[2.5rem]"
                        data-placeholder={index === 0 ? "Where we dey go?" : "Where next?"}
                        dangerouslySetInnerHTML={{ 
                          __html: rawContent[route.id] || ''
                        }}
                      />
                      {(!rawContent[route.id] || rawContent[route.id].length === 0) && (
                        <div className="absolute top-2 left-4 text-gray-400 pointer-events-none">
                          {index === 0 ? "Where we dey go?" : "Where next?"}
                        </div>
                      )}
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
                  <span className="cursor-pointer hover:text-gray-600" onClick={handleFormatHelp}>
                    Format Guide
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
