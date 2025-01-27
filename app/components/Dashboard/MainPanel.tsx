import React from "react";
import Image from "next/image";

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
					<p className="text-gray-700 mb-4 text-[16px]">
						Lorem ipsum dolor sit amet consectetur. Adipiscing donec turpis eu
						mattis nisl a placerat. Quam vel pellentesque amet ultrices. Dapibus
						malesuada magna venenatis volutpat nisi risus nec. Elit mi sodales
						iaculis pellentesque posuere at et.
					</p>
					<div className="mb-4">
						<Image
							src="/post-image.jpeg"
							alt="post content"
							className="rounded-md"
						/>
					</div>
					<div className="text-xs md:flex gap-4 grid grid-cols-6 text-gray-500">
						<div className="flex items-center gap-0.5">
							<span className="text-[12px]">
								<Image
									className="mr-0.5"
									src="/icons/thumbs-up.svg"
									alt="thumbs-up icon"
									width={16}
									height={16}
								/>
							</span>
							<span className="text-[12px]">417</span>
						</div>
						<div className="flex items-center gap-0.5">
							<span className="text-[12px]">
								<Image
									className="mr-0.5"
									src="/icons/thumbs-down.svg"
									alt="thumbs-down icon"
									width={16}
									height={16}
								/>
							</span>
							<span className="text-[12px]">117</span>
						</div>

						<div className="flex items-center gap-0.5">
							<span className="text-[12px]">
								<Image
									className="mr-0.5"
									src="/icons/comments.svg"
									alt="comments icon"
									width={16}
									height={16}
								/>
							</span>
							<span className="text-[12px]">417</span>
						</div>
						<div className="col-span-3 place-self-end flex items-center gap-0.5">
							<span className="text-[12px]">
								<Image
									className="mr-0.5"
									src="/icons/share.svg"
									alt="share icon"
									width={16}
									height={16}
								/>
							</span>
							<span className="text-[12px]">Share</span>
						</div>
					</div>
				</div>
			</div>
			{/* repeat the above block for multiple posts or use map to loop through the info*/}
		</div>
	);
};

export default MainPanel;
