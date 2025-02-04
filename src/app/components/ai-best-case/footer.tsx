"use client";
interface Props {
    handleFetchMore: () => void;
    dataLegth: number;
    setIsModalOpen: (v: boolean) => void;
}

const Footer = ({ handleFetchMore, dataLegth, setIsModalOpen }: Props) => {
    return (
        <div className="w-full bg-white items-center flex justify-between shadow-md">
            {dataLegth <= 3 && (
                <button
                    className="border-[1px] w-full py-3 border-[#ff6600] shadow-md"
                    onClick={handleFetchMore}
                >
                    <p className="text-[16px] text-[#ff6600] font-bold">
                        다른 수술 찾기
                    </p>
                </button>
            )}
            <button
                className="border-[1px] w-full py-3 border-[#ff6600] bg-[#ff6600] shadow-md"
                onClick={() => setIsModalOpen(true)}
            >
                <p className="text-[16px] text-white font-bold">
                    {dataLegth <= 3 ? "선정하기" : "베스트 리뷰 선정하기"}
                </p>
            </button>
        </div>
    );
};
export default Footer;
