"use client";

import { motion } from "framer-motion";
import { FormType } from "@/types";
import { useFormContext } from "react-hook-form";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}
// bg-[#FAE7DE]
const SelectedList = ({ open, setOpen }: Props) => {
  const { watch } = useFormContext<FormType>();
  const isBest = watch()?.isRandom?.filter((f) => f.isBest);

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: open ? 1 : 0,
      }}
      transition={{
        duration: 0.7,
        type: "spring",
      }}
      className={`tooltip w-full px-3 top-[45px] z-10 ${
        open ? "absolute" : "hidden"
      }`}
    >
      <div className="w-full bg-[#FEFAF8] border-[2px] border-[#ff6600] rounded-2xl px-3 py-2">
        {isBest?.length !== 0 ? (
          isBest?.map((b) => {
            const user = b?.user;
            const weight = b?.weight;
            const size = b?.size;

            return (
              <div
                key={user?.psEntry}
                className="grid grid-cols-2 bg-[rgba(255,102,0,0.17)] rounded-lg my-1 px-2 py-1 shadow-sm"
              >
                <div className="flex items-center">
                  <p className="text-[12px] pr-1 text-gray-700">고객:</p>
                  <p className="text-[13px] font-medium text-gray-800">
                    {`${user?.name}(${user?.sex === "F" ? "여" : "남"}, ${
                      user?.age
                    })`}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="text-[12px] pr-1 text-gray-700">부위명:</p>
                  <p className="text-[13px] font-medium text-gray-800">
                    {b?.user?.op_part}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="text-[12px] pr-1 text-gray-700">체중:</p>
                  <p className="text-[13px] font-medium text-gray-800">
                    {weight?.before ? weight.before.toFixed(1) : "0.0"} ~{" "}
                    {weight?.after ? `${weight.after.toFixed(1)}kg` : "0.0"}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="text-[12px] pr-1 text-gray-700">사이즈:</p>
                  <p className="text-[13px] font-medium text-gray-800">
                    {size?.before ? size.before.toFixed(1) : "0.0"} ~{" "}
                    {size?.after ? `${size.after.toFixed(1)}cm` : "0.0"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex w-full bg-[rgba(255,102,0,0.18)] rounded-lg py-2 my-1">
            <p className="text-[12px] px-2 text-gray-700">
              베스트 리뷰를 선택해 주세요.
            </p>
          </div>
        )}
        <div className="flex w-full justify-end">
          <button
            className="text-[12px] font-bold text-white bg-[#ff6600] px-2 py-1 rounded"
            onClick={() => setOpen(false)}
          >
            닫기
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default SelectedList;
