"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Skeletons from "./skeletons";

import { CheckedType, FormType } from "@/types";

interface ListProps {
  isCopySelected: string[];
  setIsCopySelected: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
  setIsPostEnd: (v: boolean) => void;
  setIsError: (v: boolean) => void;
  setIsMessage: (v: string) => void;
  selectedData: CheckedType[];
}

const List = (
  (
    {
      isLoading,
      setIsMessage,
      setIsPostEnd,
      setIsError,
      isCopySelected,
      setIsCopySelected,
    }: ListProps
  ) => {
    // const searchParams= useSearchParams();
    // const year = searchParams.get('year');
    // const month = searchParams.get('month');
    // const doctorId = searchParams.get('doctorId');

    const { control, watch } = useFormContext<FormType>();
    const { fields, update } = useFieldArray<FormType>({
      control,
      name: "isRandom",
    });

    // checkData를 useCallback으로 메모이제이션
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

    const handleHeartClick = (fieldIdx: number, currentId: string) => {
      const isAlreadyChecked = isCopySelected.includes(currentId);
      if (isAlreadyChecked) {
        const aaa = watch()?.isRandom?.filter(
          (v) => v?.user?.psEntry === currentId
        );
        if (aaa.length <= 2) {
          watch()?.isRandom?.map((item, itemIdx) => {
            if (item?.user?.psEntry === currentId) {
              update(itemIdx, {
                ...item,
                isBest: false,
              });
            }
          });
        }
        setIsCopySelected((prev) => prev.filter((id) => id !== currentId));
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
          update(fieldIdx, {
            ...fields[fieldIdx],
            isBest: true,
          });
          setIsCopySelected((prev) => [...prev, currentId]);
          setIsPostEnd(false);
          setIsError(false);
        }
      }
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
              key={field.id}
              className="w-full px-4 py-4 bg-white rounded-lg flex flex-col shadow-md"
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
                    <SwiperSlide key={imgIdx} className="flex w-full gap-x-2">
                      <div className="flex relative w-full gap-x-2">
                        <img
                          src={`https://mc365-backup.synology.me:8081/thumb/480/surgery${filename}`}
                          className="w-full h-[140px] border-gray-300 rounded-lg border-[1px] object-cover"
                          onError={(e) => (e.currentTarget.src = "/assets/지방이.jpg")}                       />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              {/* 정보 */}
              <div className="pt-1 w-7">
                <Controller
                  control={control}
                  name={`isRandom.${fieldIdx}.isBest`}
                  render={({ field: { value, ...field } }) => {
                    return (
                      <div
                        {...field}
                        className={`${
                          value === true ? "text-[#ff6600]" : "text-gray-400"
                        }`}
                        onClick={() => {
                          const currentId = fields?.[fieldIdx]?.user?.psEntry;
                          handleHeartClick(fieldIdx, currentId);
                        }}
                      >
                        <svg className="heart3 w-7 h-7 ">
                          <use href="/assets/sprite.svg#heart3"></use>
                        </svg>
                      </div>
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
                      {user?.name} ({user?.sex === "M" ? "남" : "여"},{" "}
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
                      {weight?.before ? weight.before.toFixed(1) : "0.0"} ~{" "}
                      {weight?.after ? `${weight.after.toFixed(1)}kg` : "0.0"}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <p className="text-[12px] leading-5 tracking-wide text-gray-600">
                      사이즈:
                    </p>
                    <p className="text-[14px] text-gray-600 font-semibold leading-5 tracking-normal">
                      {size?.before ? size.before.toFixed(1) : "0.0"} ~{" "}
                      {size?.after ? `${size.after.toFixed(1)}cm` : "0.0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && <Skeletons />}
        <Spin
          spinning={isLoading}
          fullscreen
          size="large"
          rootClassName="max-w-[480px] mx-auto"
          tip={<p className="pt-1 font-semibold">AI 분석 중...</p>}
          indicator={<LoadingOutlined spin className="text-[#ff6600]" />}
        />
      </div>
    );
  }
);
export default List;
