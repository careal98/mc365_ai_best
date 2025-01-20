"use client";

import { CheckedType, FormType } from "@/types";
import { useFormContext } from "react-hook-form";

interface Props {
  handleFetchMore: () => void;
  setIsPostEnd: (v: boolean) => void;
  setIsMessage: (v: string) => void;
  setIsError: (v: boolean) => void;
  isCopySelected: CheckedType[];
  doctorId: string;
  dataLegth: number;
}

const Footer = ({
  handleFetchMore,
  setIsPostEnd,
  setIsMessage,
  setIsError,
  isCopySelected,
  doctorId,
  dataLegth
}: Props) => {
  const { watch } = useFormContext<FormType>();
  const isRandom = watch()?.isRandom;
  const isBest = isRandom?.filter((v) => v?.isBest);

  // 베스트 선정하기
  const onPostSelected = () => {
    const isTrue = isBest?.filter((v) =>
      isCopySelected?.find(f => f.psEntry === v?.user?.psEntry && f.opDate === v?.user?.op_data)
    );
    const isFalse = watch()?.isRandom?.filter(
      (v) => isCopySelected?.find(f => !(f.psEntry === v?.user?.psEntry && f.opDate === v?.user?.op_data))
    );
    const selectedData = isTrue?.map((v) => ({
      psEntry: v.user.psEntry,
      doctorId: doctorId,
      op_date: v?.user?.op_data,
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
        setIsPostEnd(true);
        setIsMessage("베스트 리뷰로 선정했습니다.");
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
    <div className="w-full h-[80px] bg-white px-4 py-3 items-center flex justify-between gap-2 shadow-md">
      {
        dataLegth < 3 &&
      <button
      className="border-[1px] w-full py-3 rounded-lg border-[#ff6600]"
      onClick={handleFetchMore}
      >
        <p className="text-[17px] text-gray-700 font-bold">다른 수술 찾기</p>
      </button>
      }
      <button
        className="border-[1px] w-full py-3 rounded-lg border-[#ff6600] bg-[#ff6600]"
        onClick={() => onPostSelected()}
      >
        <p className="text-[17px] text-white font-bold">확정</p>
      </button>
    </div>
  );
};
export default Footer;
