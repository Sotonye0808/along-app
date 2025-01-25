import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";

interface RouteEntry {
  id: number;
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const ShareRoute = () => {
  const [creatingPost, setCreatingPost] = useState(false);
  const nextIdRef = useRef(3); // Start from 3 since we initialize with 1 and 2
  const [routes, setRoutes] = useState<RouteEntry[]>([
    { id: 1, value: "", selectionStart: 0, selectionEnd: 0 },
    { id: 2, value: "", selectionStart: 0, selectionEnd: 0 },
  ]);

  // New state for text formatting
  const [activeFormats] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCreatingPost = () => {
    setCreatingPost(!creatingPost);
  };

  const applyMarkdown = (text: string, command: string, start: number, end: number) => {
    const markdownSyntax = {
      bold: '**',
      italic: '_',
      underline: '__',
      strikeThrough: '~~'
    };
    
    const syntax = markdownSyntax[command as keyof typeof markdownSyntax];
    if (!syntax) return text;

    const before = text.slice(0, start);
    const selected = text.slice(start, end);
    const after = text.slice(end);

    return `${before}${syntax}${selected}${syntax}${after}`;
  };

  const handleTextFormat = useCallback((command: string, routeId: number) => {
    setRoutes(prev => {
      return prev.map(route => {
        if (route.id === routeId) {
          const { value, selectionStart, selectionEnd } = route;
          const newValue = applyMarkdown(value, command, selectionStart, selectionEnd);
          return { ...route, value: newValue };
        }
        return route;
      });
    });
  }, []);

  const handleRouteChange = (id: number, value: string, selectionStart: number, selectionEnd: number) => {
    const updatedRoutes = routes.map((route) =>
      route.id === id 
        ? { ...route, value, selectionStart, selectionEnd }
        : route
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
        setRoutes([...updatedRoutes, { id: nextIdRef.current, value: "", selectionStart: 0, selectionEnd: 0 }]);
        nextIdRef.current += 1;
      }
    }
  };

  const renderFormattedText = (text: string) => {
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>');

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  // Image handling functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Link handling function
  const handleAddLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      selectedImages.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, []);

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
                <div key={route.id} className="route-entry flex items-center">
                  <div className="profile-pic-placeholder w-9 h-8 rounded-full bg-gray-500 ml-2 shrink-0"></div>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder={index === 0 ? "Where we dey go?" : "Where next?"}
                      value={route.value}
                      onChange={(e) => handleRouteChange(
                        route.id,
                        e.target.value,
                        e.target.selectionStart || 0,
                        e.target.selectionEnd || 0
                      )}
                      onSelect={(e) => handleRouteChange(
                        route.id,
                        e.currentTarget.value,
                        e.currentTarget.selectionStart || 0,
                        e.currentTarget.selectionEnd || 0
                      )}
                      maxLength={index === 0 ? 300 : 200}
                      className="rounded-lg py-2 px-4 w-full bg-transparent focus:outline-none focus:border-r focus:border-y focus:border-green-500"
                    />
                    <div className="absolute top-0 left-0 pointer-events-none py-2 px-4 w-full">
                      {renderFormattedText(route.value || "\u00A0")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Image previews */}
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={img.preview}
                      alt={`Selected ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

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
                  {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                  {visibleRoutes.map((route, index) => (
                    route.selectionStart !== route.selectionEnd && (
                      <div key={`format-${route.id}`} className="flex gap-3">
                        <span
                          className={`font-bold cursor-pointer hover:text-gray-600 ${activeFormats.has('bold') ? 'text-alonggreen' : ''}`}
                          onClick={() => handleTextFormat("bold", route.id)}>
                          B
                        </span>
                        <span
                          className={`underline cursor-pointer hover:text-gray-600 ${activeFormats.has('underline') ? 'text-alonggreen' : ''}`}
                          onClick={() => handleTextFormat("underline", route.id)}>
                          U
                        </span>
                        <span
                          className={`italic cursor-pointer hover:text-gray-600 ${activeFormats.has('italic') ? 'text-alonggreen' : ''}`}
                          onClick={() => handleTextFormat("italic", route.id)}>
                          I
                        </span>
                        <span
                          className={`line-through cursor-pointer hover:text-gray-600 ${activeFormats.has('strikeThrough') ? 'text-alonggreen' : ''}`}
                          onClick={() => handleTextFormat("strikeThrough", route.id)}>
                          S
                        </span>
                      </div>
                    )
                  ))}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <span className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Image src="/icons/image.svg" alt="image icon" width={12} height={12} />
                  </span>
                  <span className="cursor-pointer" onClick={handleAddLink}>
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
