"use client";

import { CheckedType, FormType } from "@/types";
import { Spin } from "antd";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  handleFetchMore: () => void;
  setIsPostEnd: (v: boolean) => void;
  setIsMessage: (v: string) => void;
  setIsError: (v: boolean) => void;
  isCopySelected: CheckedType[];
  doctorId: string;
  dataLegth: number;
  setOpen: (v: boolean) => void;
}

const Footer = ({
  handleFetchMore,
  setIsPostEnd,
  setIsMessage,
  setIsError,
  isCopySelected,
  doctorId,
  dataLegth,
  setOpen
}: Props) => {
  const [isHeartClick, setIsHeartClick] = useState(false);

  const { watch } = useFormContext<FormType>();
  const isRandom = watch()?.isRandom;
  const isBest = isRandom?.filter((v) => v?.isBest);
  const isNotBest = isRandom?.filter((v) => !v?.isBest);

  // 베스트 선정하기
  const onPostSelected = () => {
    setIsHeartClick(true);
    const isTrue =  isBest?.filter((v) =>
      isCopySelected?.find(f => f.psEntry === v?.user?.psEntry && f.opDate === v?.user?.op_data)
    );
    const isFalse = isNotBest?.filter(
      (v) => isCopySelected?.find(f => !(f.psEntry === v?.user?.psEntry && f.opDate === v?.user?.op_data))
    );
    const selectedData = isTrue?.length !== 0 ? isTrue?.map((v) => ({
      psEntry: v.user.psEntry,
      doctorId: doctorId,
      op_date: v?.user?.op_data,
    })) : isCopySelected?.map(c => ({
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
        setTimeout(() => {
          setIsPostEnd(true);
          setIsMessage("베스트 리뷰로 선정했습니다.");
        }, 750);
      })
      .catch((error) => {
        setTimeout(() => {
          console.error("Error sending data:", error);
          setIsPostEnd(true);
          setIsError(true);
          setIsMessage("베스트 리뷰 선정을 실패했습니다.");
        }, 750);
      });
    setIsPostEnd(false);
    setIsPostEnd(false);
    setOpen(false)
  };

  useEffect(() => {
    if(isHeartClick){
      setTimeout(() => {
        setIsHeartClick(false);
      }, 800);
    }
  }, [isHeartClick]);

  return (
    <div className="w-full bg-white items-center flex justify-between shadow-md">
      {
        dataLegth <= 3 &&
      <button
      className="border-[1px] w-full py-3 border-[#ff6600] shadow-md"
      onClick={handleFetchMore}
      >
        <p className="text-[17px] text-[#ff6600] font-bold">다른 수술 찾기</p>
      </button>
      } 
      <button
        className="border-[1px] w-full py-3 border-[#ff6600] bg-[#ff6600] shadow-md"
        onClick={() => onPostSelected()}
      >
        <p className="text-[17px] text-white font-bold">
          {dataLegth <= 3  ? '선정하기' : '베스트 리뷰 선정하기'}
        </p>
      </button>
      <Spin
          key={`isHeartClick_${JSON.stringify(isHeartClick)}`}
          spinning={isHeartClick}
          fullscreen
          size="large"
          rootClassName="max-w-[480px] mx-auto"
          indicator={<img src='/assets/heart10.gif' alt="Heart Animation" width="24" />}
        />
    </div>
  );
};
export default Footer;
