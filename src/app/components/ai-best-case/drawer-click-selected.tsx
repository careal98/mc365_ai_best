"use client";

import { CheckedType, FormType } from "@/types";
import { imgUrl } from "@/variables";
import { Drawer } from "antd";
import { useFormContext } from "react-hook-form";

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    setIsPostEnd: (v: boolean) => void;
    setIsMessage: (v: string) => void;
    setIsError: (v: boolean) => void;
    isCopySelected: CheckedType[];
    doctorId: string;
    setIsModalOpen: (v: boolean) => void;
    setIsSelectedConfirm: (v: boolean) => void;
}
const DrawerClickSelected = ({
    open,
    setIsPostEnd,
    setIsMessage,
    setIsError,
    isCopySelected,
    doctorId,
    setIsModalOpen,
    setIsSelectedConfirm,
}: Props) => {
    // const [isHeartClick, setIsHeartClick] = useState(false);

    const { watch } = useFormContext<FormType>();
    const isRandom = watch()?.isRandom;
    const isBest = isRandom?.filter((v) => v?.isBest);
    const isNotBest = isRandom?.filter((v) => !v?.isBest);

    // 베스트 선정하기
    const onPostSelected = () => {
        const isTrue = isBest?.filter((v) =>
            isCopySelected?.find(
                (f) =>
                    f.psEntry === v?.user?.psEntry &&
                    f.opDate === v?.user?.op_data
            )
        );
        const isFalse = isNotBest?.filter((v) =>
            isCopySelected?.find(
                (f) =>
                    !(
                        f.psEntry === v?.user?.psEntry &&
                        f.opDate === v?.user?.op_data
                    )
            )
        );
        const selectedData =
            isTrue?.length !== 0
                ? isTrue?.map((v) => ({
                      psEntry: v.user.psEntry,
                      doctorId: doctorId,
                      op_date: v?.user?.op_data,
                  }))
                : isCopySelected?.map((c) => ({
                      psEntry: c?.psEntry,
                      doctorId: doctorId,
                      op_date: c?.opDate,
                  }));
        const disSelectedData = isFalse?.map((u) => ({
            psEntry: u.user.psEntry,
            doctorId: doctorId,
            op_date: u?.user?.op_data,
        }));
        const req = [
            { selected: [...selectedData] },
            { unselected: [...disSelectedData] },
        ];

        fetch(`/api/best`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req),
        })
            .then((response) => response.json())
            .then(() => {
                setIsSelectedConfirm(true);
                setIsModalOpen(false);
                // setIsPostEnd(true);
                // setIsMessage("베스트 리뷰로 선정했습니다.");
            })
            .catch((error) => {
                console.error("Error sending data:", error);
                setIsPostEnd(true);
                setIsError(true);
                setIsMessage("베스트 리뷰 선정을 실패했습니다.");
            });
        setIsPostEnd(false);
        setIsPostEnd(false);
        // setOpen(false);
    };

    // useEffect(() => {
    //     if (isHeartClick) {
    //         setTimeout(() => {
    //             setIsHeartClick(false);
    //         }, 1000);
    //     }
    // }, [isHeartClick]);

    return (
        <>
            <Drawer
                placement="bottom"
                open={open}
                closable={false}
                maskClosable={true}
                className="rounded-t-lg"
                height={330}
            >
                <div className="flex flex-col bg-white h-[100%] w-full max-w-[480px] mx-auto px-4 py-4 rounded-lg">
                    <div className="flex w-full gap-1">
                        {Array.from({ length: 3 }, (_, i) => {
                            const imgs = isBest?.[i]?.imgs;
                            return (
                                <div
                                    key={i}
                                    className="flex flex-col w-full shadow-md rounded-md"
                                >
                                    <img
                                        src={`${imgUrl}${imgs?.beforeImgs?.[0]?.slice(
                                            4
                                        )}`}
                                        className="object-cover h-[110px] rounded-t-md"
                                        onError={(e) =>
                                            (e.currentTarget.src =
                                                "/assets/지방이.jpg")
                                        }
                                    />
                                    <img
                                        src={`${imgUrl}${imgs?.afterImgs?.[0]?.slice(
                                            4
                                        )}`}
                                        className="object-cover h-[110px] rounded-b-md"
                                        onError={(e) =>
                                            (e.currentTarget.src =
                                                "/assets/지방이.jpg")
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-full flex flex-col pt-2 justify-between">
                        <p className="text-[14px] font-semibold pt-1 text-gray-800">
                            선택한 수술을 베스트 리뷰로 선정하시겠습니까?
                        </p>
                        <div className="flex w-full justify-center gap-1">
                            <button
                                className="w-full border-[1px] border-[#FF6600] py-2 rounded-md shadow-md"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <p className="text-[14px] text-[#FF6600] font-bold">
                                    다시 선택할래요.
                                </p>
                            </button>
                            <button
                                className="w-full py-1 bg-[#FF6600] rounded-md shadow-md"
                                onClick={onPostSelected}
                            >
                                <p className="text-[14px] text-white font-bold">
                                    네, 확인했습니다.
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </Drawer>
            {/* <Spin
                key={`isHeartClick_${JSON.stringify(isHeartClick)}`}
                spinning={isHeartClick}
                fullscreen
                size="large"
                rootClassName="max-w-[480px] mx-auto"
                indicator={
                    <img
                        src="/assets/heart10.gif"
                        alt="Heart Animation"
                        width="24"
                    />
                }
            /> */}
        </>
    );
};
export default DrawerClickSelected;
