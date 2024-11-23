import React, { useState, useCallback, useRef } from "react";

const ShareRoute = () => {
  const [creatingPost, setCreatingPost] = useState(false);
  const nextIdRef = useRef(3); // Start from 3 since we initialize with 1 and 2
  const [routes, setRoutes] = useState([
    { id: 1, value: '' },
    { id: 2, value: '' }
  ]);

  const toggleCreatingPost = () => {
    setCreatingPost(!creatingPost);
  };

  const handleRouteChange = (id: number, value: string) => {
    const updatedRoutes = routes.map(route =>
      route.id === id ? { ...route, value } : route
    );

    // If a route is emptied, remove all subsequent routes
    if (!value) {
      const currentIndex = routes.findIndex(route => route.id === id);
      if (currentIndex >= 1) { // Allow first route to be empty
        const filteredRoutes = updatedRoutes.filter((_, index) => index <= currentIndex);
        setRoutes(filteredRoutes);
        return;
      }
    }

    setRoutes(updatedRoutes);

    // Add new input only if typing in last input AND all previous routes have values
    if (id === routes[routes.length - 1].id && value.length > 0) {
      const allPreviousHaveValue = routes.every((route, index) => 
        index === routes.length - 1 || route.value.trim() !== ''
      );
      
      if (allPreviousHaveValue) {
        setRoutes([...updatedRoutes, { id: nextIdRef.current, value: '' }]);
        nextIdRef.current += 1;
      }
    }
  };

  // the input elements still need to be handled more for formatting to take effect!
  const handleTextFormat = useCallback((command: string) => {
    document.execCommand(command, false);
  }, []);

  // In the render section, filter routes based on previous route having content
  const visibleRoutes = routes.filter((route, index) => {
    if (index === 0) return true; // Always show first route
    return routes[index - 1].value.trim() !== ''; // Show only if previous has content
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
        <button className="mr-2 bg-green-700 text-white px-4 py-2 rounded-md">
          Post
        </button>
      </div>
      <button type="button" onClick={toggleCreatingPost} className="flex h-full w-fit justify-center items-center md:hidden text-3xl text-green-700">✍</button>
      <div id="actual-post-creation"
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
                className="place-self-end rounded-lg p-1 border border-gray-400 text-green-600 font-semibold text-sm">
                Drafts
              </button>
            </div>
            <div id="route-entries" className="flex flex-col gap-8 max-h-[40vh] md:max-h-[50vh] overflow-y-auto px-2">
              {visibleRoutes.map((route, index) => (
                <div key={route.id} className="route-entry flex items-center">
                  <div className="profile-pic-placeholder w-9 h-8 rounded-full bg-gray-600 ml-2 shrink-0"></div>
                  <input
                    type="text"
                    placeholder={index === 0 ? "Where we dey go?" : "Where next?"}
                    value={route.value}
                    onChange={(e) => handleRouteChange(route.id, e.target.value)}
                    maxLength={index === 0 ? 300 : 200}
                    className="rounded-lg py-2 px-4 w-full bg-transparent focus:outline-none focus:border-r focus:border-y focus:border-green-500"
                  />
                </div>
              ))}
            </div>
            <div id="actions" className="flex justify-between gap-4 w-full">
              <div className="flex justify-center items-center gap-4">
                <button
                  type="button"
                  className="place-self-end rounded-lg p-1 border border-gray-400 text-green-700 font-semibold text-xs">
                  # Add tags
                </button>
                <div id="text-editor" className="text-xs text-gray-400 flex justify-center items-center gap-3">
                  <span 
                    className="font-bold cursor-pointer hover:text-gray-600" 
                    onClick={() => handleTextFormat('bold')}
                  >B</span>
                  <span 
                    className="underline cursor-pointer hover:text-gray-600" 
                    onClick={() => handleTextFormat('underline')}
                  >U</span>
                  <span 
                    className="italic cursor-pointer hover:text-gray-600" 
                    onClick={() => handleTextFormat('italic')}
                  >I</span>
                  <span 
                    className="line-through cursor-pointer hover:text-gray-600" 
                    onClick={() => handleTextFormat('strikeThrough')}
                  >S</span>
                  <span>🖼</span>
                  <span>📎</span>
                </div>
              </div>
              <button type="button" className="mr-2 bg-green-700 hover:bg-opacity-85 text-white text-sm px-2 py-1 rounded-md">
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
