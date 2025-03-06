"use client";

import { CheckedType, FormType } from "@/types";
import { imgUrl } from "@/variables";
import { Modal } from "antd";
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
const ClickSelected = ({
    open,
    setIsPostEnd,
    setIsMessage,
    setIsError,
    isCopySelected,
    doctorId,
    setIsModalOpen,
    setIsSelectedConfirm,
}: Props) => {
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
            .then((res) => {
                if (res.success) {
                    setIsSelectedConfirm(true);
                    setIsModalOpen(false);
                } else {
                    console.log(res.message);
                }
            })
            .catch((error) => {
                console.error("Error sending data:", error);
                setIsPostEnd(true);
                setIsError(true);
                setIsMessage("베스트 리뷰 선정을 실패했습니다.");
            });
        setIsPostEnd(false);
        setIsPostEnd(false);
    };

    return (
        <>
            <Modal
                open={open}
                centered
                closable={false}
                maskClosable={false}
                footer={() => {
                    return (
                        <div className="flex w-full justify-end gap-1 px-4 pb-4">
                            <button
                                className="w-full border-[1px] border-[#FF6600] rounded-md"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <p className="text-[14px] text-[#FF6600] font-semibold">
                                    다시 선택할래요.
                                </p>
                            </button>
                            <button
                                className="w-full py-1 bg-[#FF6600] rounded-md"
                                onClick={onPostSelected}
                            >
                                <p className="text-[14px] text-white font-semibold">
                                    네, 확인했습니다.
                                </p>
                            </button>
                        </div>
                    );
                }}
            >
                <div className="bg-white w-full h-auto max-w-[480px] mx-auto px-4 pt-4 rounded-lg">
                    <div className="flex w-full gap-1">
                        {Array.from({ length: 3 }, (_, i) => {
                            const imgs = isBest?.[i]?.imgs;
                            return (
                                <div
                                    key={i}
                                    className="flex flex-col w-full shadow-md rounded-md"
                                >
                                    {/* <img
                                        src={`${imgUrl}${imgs?.beforeImgs?.[0]?.slice(
                                            4
                                        )}`}
                                        className="object-cover h-[100px] rounded-t-md"
                                    /> */}
                                    <img
                                        src={`${imgUrl}${imgs?.[0]?.slice(4)}`}
                                        className="object-cover h-[100px] rounded-md"
                                        onError={(e) =>
                                            (e.currentTarget.src =
                                                "/assets/지방이.jpg")
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[14px] font-medium pt-1 text-gray-800">
                        선택한 수술을 베스트 리뷰로 선정하시겠습니까?
                    </p>
                </div>
            </Modal>
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
export default ClickSelected;
