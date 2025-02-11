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
import {
    Dispatch,
    forwardRef,
    SetStateAction,
    useCallback,
    useState,
} from "react";
import { imgUrl } from "@/variables";
import { Player } from "@lottiefiles/react-lottie-player";

interface ListProps {
    isCopySelected: CheckedType[];
    setIsCopySelected: React.Dispatch<React.SetStateAction<CheckedType[]>>;
    isLoading: boolean;
    setIsPostEnd: (v: boolean) => void;
    setIsError: (v: boolean) => void;
    setIsMessage: (v: string) => void;
    setIsAnimating: (v: boolean) => void;
    previewImages: Record<number, string[]>;
    setPreviewImages: Dispatch<SetStateAction<Record<number, string[]>>>;
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
            previewImages,
            setPreviewImages,
        }: ListProps,
        ref
    ) => {
        const [loadingImages, setLoadingImages] = useState<boolean[]>([]);

        const handleImageLoad = (index: number) => {
            const updatedLoadingImages = [...loadingImages];
            updatedLoadingImages[index] = false;
            setLoadingImages(updatedLoadingImages);
        };
        const { control, setValue } = useFormContext<FormType>();
        const { fields } = useFieldArray<FormType>({
            control,
            name: "isRandom",
        });

        // 클릭 시 이미지 상세
        const onHandleImgs = useCallback(
            async (psEntry: string, opDate: string) => {
                if (!psEntry || !opDate) return;

                try {
                    const response = await fetch(
                        `/api/images?psEntry=${psEntry}&opDate=${opDate}`,
                        {
                            method: "GET",
                            mode: "no-cors",
                        }
                    );
                    const result = await response.json();
                    return result;
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            },
            []
        );

        const onHandleClick = async (
            fieldIdx: number,
            psEntry: string,
            opDate: string
        ) => {
            try {
                const res = await onHandleImgs(psEntry, opDate);
                const images: string[] = res?.flatMap((v: string) => v) ?? [];

                setPreviewImages((prev) => ({
                    ...prev,
                    [fieldIdx]: images,
                }));
            } catch (error) {
                console.error("이미지 로딩 오류:", error);
            }
        };

        const handleHeartClick = (
            fieldIdx: number,
            currentId: string,
            currentOpDate: string
        ) => {
            const isAlreadyChecked = isCopySelected.find(
                (f) => f.psEntry === currentId && f.opDate === currentOpDate
            );
            if (isAlreadyChecked) {
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
                    setValue(`isRandom.${fieldIdx}.isBest`, true);
                    setIsCopySelected((prev) =>
                        prev
                            ? [
                                  ...prev,
                                  {
                                      psEntry: currentId,
                                      opDate: currentOpDate,
                                  },
                              ]
                            : [
                                  {
                                      psEntry: currentId,
                                      opDate: currentOpDate,
                                  },
                              ]
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
                    const imgs = field?.imgs;
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
                                {imgs?.map((img, imgIdx) => {
                                    const filename = img.slice(4);
                                    return (
                                        <SwiperSlide
                                            key={imgIdx}
                                            className="flex w-full"
                                        >
                                            <Image.PreviewGroup
                                                items={previewImages?.[
                                                    fieldIdx
                                                ]?.map(
                                                    (v) =>
                                                        `${imgUrl}${v.slice(4)}`
                                                )}
                                                preview={{
                                                    countRender: (
                                                        current,
                                                        total
                                                    ) => {
                                                        return (
                                                            <>
                                                                {total === 2 ? (
                                                                    <Player
                                                                        autoplay
                                                                        loop
                                                                        keepLastFrame
                                                                        src="/assets/loading.json"
                                                                        className="w-[200px] relative top-[45px]"
                                                                    />
                                                                ) : (
                                                                    <p className="font-bold text-[15px] text-white">{`${current}/${total}`}</p>
                                                                )}
                                                            </>
                                                        );
                                                    },
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
                                                                className="w-full max-w-[480px] relative"
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
                                                    onLoad={() =>
                                                        handleImageLoad(imgIdx)
                                                    }
                                                    onClick={() =>
                                                        onHandleClick(
                                                            fieldIdx,
                                                            user?.psEntry,
                                                            user?.op_data
                                                        )
                                                    }
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
