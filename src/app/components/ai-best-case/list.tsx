"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Image, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Skeletons from "./skeletons";
import { CheckedType, FormType } from "@/types";
import { forwardRef } from "react";
import { imgUrl } from "@/variables";

interface ListProps {
    isCopySelected: CheckedType[];
    setIsCopySelected: React.Dispatch<React.SetStateAction<CheckedType[]>>;
    isLoading: boolean;
    setIsPostEnd: (v: boolean) => void;
    setIsError: (v: boolean) => void;
    setIsMessage: (v: string) => void;
    selectedData: CheckedType[];
    setIsAnimating: (v: boolean) => void;
}

const List = forwardRef<HTMLDivElement, ListProps>(
    (
        {
            isLoading,
            setIsMessage,
            setIsPostEnd,
            setIsError,
            isCopySelected,
            setIsCopySelected,
            setIsAnimating,
        }: ListProps,
        ref
    ) => {
        const { control, setValue } = useFormContext<FormType>();
        const { fields } = useFieldArray<FormType>({
            control,
            name: "isRandom",
        });

        // const checkData = useCallback(async () => {
        //   try {
        //     const response = await fetch(
        //       `/api/check/?year=${year}&month=${month}&doctorId=${doctorId}`
        //     );
        //     const result = await response.json();
        //     return result;
        //   } catch (error) {
        //     console.error("Error fetching data:", error);
        //     return null;
        //   }
        // }, [year, month, doctorId]);

        // useEffect(() => {
        //   checkData().then((res) => {
        //     if (res) {
        //       // 필요한 로직을 여기에 추가
        //     }
        //   });
        // }, [checkData]);

        const handleHeartClick = (
            fieldIdx: number,
            currentId: string,
            currentOpDate: string
        ) => {
            const isAlreadyChecked = isCopySelected.find(
                (f) => f.psEntry === currentId && f.opDate === currentOpDate
            );
            if (isAlreadyChecked) {
                // const aaa = watch()?.isRandom?.filter(
                //   (v) => v?.user?.psEntry === currentId && v?.user?.op_data === currentOpDate
                // );
                // console.log('aaa', aaa)
                // if (aaa.length <= 1) {
                //   watch()?.isRandom?.map((item, itemIdx) => {
                //     console.log(item?.user?.psEntry === currentId && item?.user?.op_data === currentOpDate);
                //     if (item?.user?.psEntry === currentId && item?.user?.op_data === currentOpDate) {
                //       // update(itemIdx, {
                //       //   ...item,
                //       //   isBest: false,
                //       // });
                //       setValue(`isRandom.${itemIdx}.isBest`, false)
                //     }
                //   });
                // }
                setValue(`isRandom.${fieldIdx}.isBest`, false);
                setIsCopySelected((prev) =>
                    prev.filter(
                        (p) =>
                            !(
                                p.psEntry === currentId &&
                                p.opDate === currentOpDate
                            )
                    )
                );
                setIsPostEnd(false);
                setIsError(false);
            } else {
                if (isCopySelected.length >= 3) {
                    setIsMessage(
                        "이미 3개를 선택했습니다. \n취소 후 다시 선택해 주세요."
                    );
                    setIsPostEnd(true);
                    setIsError(true);
                } else {
                    // update(fieldIdx, {
                    //   ...fields[fieldIdx],
                    //   isBest: true,
                    // });
                    // });
                    setValue(`isRandom.${fieldIdx}.isBest`, true);
                    setIsCopySelected((prev) =>
                        prev
                            ? [
                                  ...prev,
                                  { psEntry: currentId, opDate: currentOpDate },
                              ]
                            : [{ psEntry: currentId, opDate: currentOpDate }]
                    );
                    setIsPostEnd(false);
                    setIsError(false);
                }
            }

            setIsAnimating(true);

            setTimeout(() => {
                setIsAnimating(false);
            }, 1900);
        };

        return (
            <div className="w-full flex flex-col py-2 h-full px-4 gap-y-2 overflow-scroll bg-[#ff6600]/10">
                {fields?.map((field, fieldIdx) => {
                    const user = field?.user;
                    const size = field?.size;
                    const weight = field?.weight;
                    const newImgs =
                        field?.imgs?.beforeImgs
                            ?.map((bImg, bImgIdx) => {
                                const aImg = field?.imgs?.afterImgs?.[bImgIdx];
                                return aImg ? [bImg, aImg] : [bImg];
                            })
                            .flat() || [];
                    return (
                        <div
                            key={`${field.id}_${user.op_part}`}
                            className="card w-full px-4 py-4 bg-white rounded-lg flex flex-col shadow-md"
                        >
                            {/* 이미지 */}
                            <Swiper
                                slidesPerView={2}
                                spaceBetween={4}
                                slidesPerGroup={2}
                                className="flex w-full overflow-hidden"
                            >
                                {newImgs?.map((img, imgIdx) => {
                                    const filename = img.slice(4);
                                    return (
                                        <SwiperSlide
                                            key={imgIdx}
                                            className="flex w-full"
                                        >
                                            <Image.PreviewGroup
                                                items={newImgs?.map(
                                                    (v) =>
                                                        `${imgUrl}${v.slice(4)}`
                                                )}
                                                preview={{
                                                    imageRender: (
                                                        originalNode,
                                                        info
                                                    ) => {
                                                        const current =
                                                            info.current;
                                                        const after =
                                                            (current + 1) %
                                                                2 ===
                                                            0
                                                                ? true
                                                                : false;
                                                        return (
                                                            <div
                                                                key={current}
                                                                className="w-full relative"
                                                            >
                                                                <div
                                                                    className={`ml-2 mt-2 absolute z-[999] px-1 py-1 rounded-md ${
                                                                        after
                                                                            ? "bg-[#FF6600]/50"
                                                                            : "bg-gray-600/50"
                                                                    }`}
                                                                >
                                                                    <p className="text-white text-[12px] font-medium">
                                                                        {after
                                                                            ? "AFTER"
                                                                            : "BEFORE"}
                                                                    </p>
                                                                </div>
                                                                {originalNode}
                                                            </div>
                                                        );
                                                    },
                                                }}
                                            >
                                                <Image
                                                    height={140}
                                                    width={"100%"}
                                                    src={`${imgUrl}${filename}`}
                                                    loading="lazy"
                                                    className="w-full h-[140px] rounded-lg object-cover"
                                                    onError={(e) =>
                                                        (e.currentTarget.src =
                                                            "/assets/지방이.jpg")
                                                    }
                                                    preview={{
                                                        maskClassName:
                                                            "rounded-xl object-cover",
                                                    }}
                                                />
                                            </Image.PreviewGroup>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                            {/* 정보 */}
                            <div className="pt-1 w-full flex">
                                <Controller
                                    control={control}
                                    name={`isRandom.${fieldIdx}.isBest`}
                                    render={({
                                        field: { value, ...field },
                                    }) => {
                                        return (
                                            <button
                                                {...field}
                                                className={`w-7 ${
                                                    value === true
                                                        ? "text-[#ff6600]"
                                                        : "text-gray-400"
                                                }`}
                                                onClick={() => {
                                                    const currentId =
                                                        fields?.[fieldIdx]?.user
                                                            ?.psEntry;
                                                    const currentOpDate =
                                                        fields?.[fieldIdx]?.user
                                                            ?.op_data;
                                                    handleHeartClick(
                                                        fieldIdx,
                                                        currentId,
                                                        currentOpDate
                                                    );
                                                }}
                                            >
                                                <svg className="heart3 w-7 h-7">
                                                    <use href="/assets/sprite.svg#heart3"></use>
                                                </svg>
                                            </button>
                                        );
                                    }}
                                />
                            </div>
                            <div className="">
                                <div className="grid grid-cols-2">
                                    <div className="flex items-start">
                                        <p className="text-[12px] leading-5 tracking-wide text-gray-600">
                                            고객:
                                        </p>
                                        <p className="text-[14px] text-gray-600 font-semibold leading-5 tracking-normal">
                                            {user?.name} (
                                            {user?.sex === "M" ? "남" : "여"},{" "}
                                            {user?.age})
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <p className="text-[12px] leading-5 tracking-wide text-gray-600">
                                            부위명:
                                        </p>
                                        <p className="text-[14px] text-gray-600 font-semibold leading-5 tracking-normal">
                                            {user?.op_part}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2">
                                    <div className="flex items-start">
                                        <p className="text-[12px] leading-5 tracking-wide text-gray-600">
                                            체중:
                                        </p>
                                        <p className="text-[14px] text-gray-600 font-semibold leading-5 tracking-normal">
                                            {weight?.before
                                                ? weight.before.toFixed(1)
                                                : "0.0"}{" "}
                                            ~{" "}
                                            {weight?.after
                                                ? `${weight.after.toFixed(1)}kg`
                                                : "0.0"}
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <p className="text-[12px] leading-5 tracking-wide text-gray-600">
                                            사이즈:
                                        </p>
                                        <p className="text-[14px] text-gray-600 font-semibold leading-5 tracking-normal">
                                            {size?.before
                                                ? size.before.toFixed(1)
                                                : "0.0"}{" "}
                                            ~{" "}
                                            {size?.after
                                                ? `${size.after.toFixed(1)}cm`
                                                : "0.0"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isLoading && <Skeletons />}
                <Spin
                    key={JSON.stringify(isLoading)}
                    spinning={isLoading}
                    fullscreen
                    size="large"
                    rootClassName="max-w-[480px] mx-auto"
                    tip={<p className="pt-1 font-semibold">AI 분석 중...</p>}
                    indicator={
                        <LoadingOutlined spin className="text-[#ff6600]" />
                    }
                />
                {!isLoading && (
                    <div ref={ref} style={{ height: "1px", bottom: "-30px" }} />
                )}
            </div>
        );
    }
);
List.displayName = "List";
export default List;
