import React from "react";

const MainPanel = () => {
	return (
		<div className="flex flex-col space-y-6">
			{/* sample post */}
			<div className="p-4 bg-white rounded-md border">
				<div className="flex items-center mb-4">
					<div className="w-8 h-8 rounded-full bg-gray-300 mr-4"></div>
					<div className="flex items-center">
						<div className="font-semibold pr-4">Cartoon Network</div>
						<span className="text-gray-500 text-sm">3h</span>
					</div>
				</div>
				<div className="md:pl-12">
					<p className="text-gray-700 mb-4">
						Lorem ipsum dolor sit amet consectetur. Adipiscing donec turpis eu
						mattis nisl a placerat. Quam vel pellentesque amet ultrices. Dapibus
						malesuada magna venenatis volutpat nisi risus nec. Elit mi sodales
						iaculis pellentesque posuere at et.
					</p>
					<div className="mb-4">
						<img
							src="https://via.placeholder.com/400x200"
							alt="post content"
							className="rounded-md"
						/>
					</div>
					<div className="text-xs md:flex gap-4 grid grid-cols-6 text-gray-500">
						<div className="flex items-center gap-0.5">
							<span>
								👍
								{/* i don't know what ui kini we're using */}
							</span>
							<span>417</span>
						</div>
						<div className="flex items-center gap-0.5">
							<span>👎</span>
							<span>117</span>
						</div>
						
						<div className="flex items-center gap-0.5">
							<span>💬</span>
							<span>417</span>
						</div>
						<div className="col-span-3 place-self-end flex items-center gap-0.5">
							<span>🔗</span>
							<span>Share</span>
						</div>
					</div>
				</div>
			</div>
			{/* repeat the above block for multiple posts or use map to loop through the info*/}
		</div>
	);
};

export default MainPanel;
