import React, { useState } from "react";

const ShareRoute = () => {
  const [creatingPost, setCreatingPost] = useState(true);

  const toggleCreatingPost = () => {
    setCreatingPost(!creatingPost);
  };

  return (
    <div className="w-full">
      <div className="p-2 bg-white rounded-xl border flex items-center justify-between w-11/12 mr-4">
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
      <div
        className={`fixed top-0 right-0 z-30 w-screen h-screen bg-gray-900 bg-opacity-90 flex justify-center items-center ${
          creatingPost ? "" : "hidden"
        }`}>
        <div className="w-5/6 md:w-8/12 rounded-xl p-4 bg-gray-100 relative flex flex-col gap-4">
          <button
            className="w-full text-right text-2xl text-gray-400 absolute block right-2 hover:text-gray-800"
            type="button"
            onClick={toggleCreatingPost}>
            x
          </button>
          <form className="mt-16 flex flex-col gap-6">
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
            <div className="flex items-center">
              <div className="w-9 h-8 rounded-full bg-gray-800 ml-2"></div>
              <input
                type="text"
                placeholder="Where we dey go?"
                className="rounded-lg py-2 px-4 w-full bg-transparent focus:outline-none focus:border-r focus:border-y focus:border-green-500"
              />
            </div>
            <div className="flex items-center">
              <div className="w-7 h-6 rounded-full bg-gray-800 ml-3"></div>
              <input
                type="text"
                placeholder="Where next?"
                className="rounded-lg py-1 px-2 text-sm w-full bg-transparent focus:outline-none focus:border-r focus:border-y focus:border-green-500"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareRoute;
