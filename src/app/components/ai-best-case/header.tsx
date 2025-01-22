"use client";

interface Props {
  doctorName: string;
  selectedCount: number;
  prevYear: number;
  prevMonth: number;
  isAnimating: boolean;
  open: boolean;
  setOpen: (v : boolean) => void;
}

const Header = ({ doctorName, selectedCount, prevYear, prevMonth, isAnimating, open, setOpen }: Props) => {

  return (
    <div className="py-3 px-4 w-full flex justify-between shadow-md items-center">
      <div className="flex items-center gap-x-1">
        <img
          src="/assets/doctor.png"
          className="w-6 h-6 border-[1px] border-gray-400 rounded-full"
        />
        <p className="text-[14px] text-gray-700 font-semibold">{doctorName}</p>
      </div>
      <div className="flex items-center">
        <p className="text-[16px] text-gray-700 font-semibold">
          {`AI 베스트 리뷰 - ${prevYear.toString().slice(2)}년 ${prevMonth}월`}
        </p>
      </div>
      <button className="flex items-center gap-x-1 w-[50px] cursor-pointer" onClick={() => setOpen(!open)}>
        {isAnimating ? (
            <img src='/assets/heart10.gif' alt="Heart Animation" width="24" />
          ) : (
            <svg className="heart3 w-6 h-6 text-[#ff6600]">
            <use href="/assets/sprite.svg#heart3"></use>
          </svg>
          )}
        <p className="text-[14px] text-gray-700 font-semibold lining-nums mb-1">
          {selectedCount}/3
        </p>
      </button>
    </div>  
  );
};
export default Header;
