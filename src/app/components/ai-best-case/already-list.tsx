import { Player } from "@lottiefiles/react-lottie-player";

const AlreadyList = () => {
    return (
        <>
            <div className="w-full flex flex-col py-2 h-full px-4 gap-y-2 overflow-scroll bg-[#ff6600]/10">
                <div className="flex flex-col flex-1 justify-center items-center gap-8 pb-10">
                    <Player
                        autoplay
                        // loop
                        keepLastFrame
                        src="/assets/success.json"
                        style={{ height: "100px", width: "100px" }}
                    />
                    <p className="text-[18px] font-medium text-gray-800">
                        이미 베스트 리뷰를 선정하셨습니다.
                    </p>
                    <div className="flex justify-center">
                        <p className="text-[14px] font-medium text-gray-800 whitespace-pre-wrap">
                            선정하신 리뷰는{" "}
                            <span className="text-[#FF6600] font-bold">
                                365mc 통합 시스템
                            </span>
                            {`\n베스트 리뷰에서 확인하실 수 있습니다.`}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AlreadyList;
