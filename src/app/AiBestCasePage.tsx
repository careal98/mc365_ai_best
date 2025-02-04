"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    AlreadyList,
    DrawerClickSelected,
    Footer,
    Header,
    List,
    Noti,
    SelectedList,
    SeletedConfirm,
} from "@/app/components/ai-best-case";
import { CheckedType, DataType, FormType } from "@/types";
import { FormProvider, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";

const limit = 3;

const AiBestCasePage = () => {
    const searchParams = useSearchParams();
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const doctorId = searchParams.get("doctorId");

    const [data, setData] = useState<DataType[]>([]);
    const [firstData, setFirstData] = useState<DataType[]>([]);
    const [checkedData, setCheckedData] = useState<CheckedType[]>([]);
    const [isCopySelected, setIsCopySelected] = useState<CheckedType[]>([]);
    const [isTotalCount, setIsTotalCount] = useState(0);
    const [isIndex, setIsIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isPostEnd, setIsPostEnd] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isMessage, setIsMessage] = useState("");
    const [isClick, setIsClick] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [open, setOpen] = useState(false);
    const [isModalopen, setIsModalOpen] = useState(false);
    const [isSelectedConfirm, setIsSelectedConfirm] = useState(false);

    // 현재 노출되는 카트의 인덱스 구하기
    const cards = document.querySelectorAll(".card");
    const observerOptions = {
        root: null,
        rootMargin: "0px 0px 550px 0px",
        threshold: 1,
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = [...cards].indexOf(entry.target) + 1;
                setIsIndex(index);
            }
        });
    }, observerOptions);
    cards.forEach((card) => observer.observe(card));

    const metods = useForm<FormType>({
        defaultValues: {
            isRandom: data?.map((v: DataType) => ({
                isBest: isCopySelected?.find(
                    (f) =>
                        f?.psEntry === v?.user?.psEntry &&
                        f?.opDate === v?.user?.op_data
                )
                    ? true
                    : false,
                user: v.user,
                imgs: {
                    afterImgs: v?.imgs?.afterImgs,
                    beforeImgs: v?.imgs?.beforeImgs,
                },
                size: {
                    before: v?.size?.before,
                    after: v?.size?.after,
                },
                weight: {
                    before: v?.weight?.before,
                    after: v?.weight?.after,
                },
            })),
        },
    });
    const { reset } = metods;

    // 베스트 리뷰의 년도&날짜 구하기
    const linkYear = parseInt(year ?? "", 10);
    const linkMonth = parseInt(month ?? "", 10);

    const date = new Date(linkYear, linkMonth - 1, 1);
    date.setMonth(date.getMonth() - 2);

    const prevYear = date.getFullYear();
    const prevMonth = date.getMonth() + 1;

    // 데이터 가져오기 함수
    const fetchData = async (offset: number) => {
        try {
            const response = await fetch(
                `/api/data?year=${year}&month=${month}&doctorId=${doctorId}&offset=${offset}&limit=${limit}`,
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
    };

    // 베스트 리뷰 데이터 요청
    const handleFetchMore = () => {
        if (isClick && hasMore && !isLoading) {
            setIsLoading(true);
            fetchData(data.length)
                .then((newData) => {
                    if (newData) {
                        setData((prev) => [...prev, ...newData]);
                        if (newData.length < limit) {
                            setHasMore(false);
                        }
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    // 이미 베스트로 선정됐는지 찾는 함수
    const checkData = async () => {
        try {
            const response = await fetch(
                `/api/check/count?year=${year}&month=${month}&doctorId=${doctorId}`,
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
    };

    // 전체 카운트 함수
    const checkTotalData = async () => {
        try {
            const response = await fetch(
                `/api/data/check?year=${year}&month=${month}&doctorId=${doctorId}`,
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
    };

    // 인피니티 스크롤
    const { ref } = useInView({
        initialInView: false,
        onChange: (inView) => {
            if (data?.length <= 3) return;
            if (inView && hasMore && !isLoading) {
                handleFetchMore();
            }
        },
    });

    useEffect(() => {
        if (!isLoading) {
            setIsLoading(true);
            fetchData(0)
                .then((newData) => {
                    if (newData) {
                        setFirstData(
                            newData?.map((n: DataType) => ({
                                isBest: true,
                                user: n?.user,
                                imgs: {
                                    afterImgs: n?.imgs?.afterImgs,
                                    beforeImgs: n?.imgs?.beforeImgs,
                                },
                                size: {
                                    before: n?.size?.before,
                                    after: n?.size?.after,
                                },
                                weight: {
                                    before: n?.weight?.before,
                                    after: n?.weight?.after,
                                },
                            }))
                        );
                        setData(newData);
                        setIsClick(true);
                        if (newData.length < limit) {
                            setHasMore(false);
                        }
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    // 다른 사진 찾기 버튼 이벤트
    const onHandleData = () => {
        if (isTotalCount <= 3) {
            setIsMessage("더이상 불러올 데이터가 없습니다.");
            setIsPostEnd(true);
            setIsError(true);
            return;
        }
        handleFetchMore();
    };

    useEffect(() => {
        checkData().then((res) => {
            setCheckedData(res);
        });
        checkTotalData().then((res) => {
            setIsTotalCount(Number(res));
        });
    }, [year, month, doctorId]);

    useEffect(() => {
        // const aaa = checkedData?.map((v) => ({
        //     psEntry: v?.psEntry,
        //     opDate: v?.opDate,
        // }));
        const bbb = firstData?.map((d) => ({
            psEntry: d?.user?.psEntry,
            opDate: d?.user?.op_data,
        }));
        const ccc = [...bbb];
        const uniqueArray = Array.from(
            new Map(ccc.map((item) => [JSON.stringify(item), item])).values()
        );
        setIsCopySelected(uniqueArray);
    }, [checkedData, firstData]);

    useEffect(() => {
        reset({
            isRandom: data?.map((v: DataType) => ({
                isBest: isCopySelected?.find(
                    (f) =>
                        f?.psEntry === v?.user?.psEntry &&
                        f?.opDate === v?.user?.op_data
                )
                    ? true
                    : false,
                user: v?.user,
                imgs: {
                    afterImgs: v?.imgs?.afterImgs,
                    beforeImgs: v?.imgs?.beforeImgs,
                },
                size: {
                    before: v?.size?.before,
                    after: v?.size?.after,
                },
                weight: {
                    before: v?.weight?.before,
                    after: v?.weight?.after,
                },
            })),
        });
    }, [data, isCopySelected, reset]);
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <FormProvider {...metods}>
                <div className="flex relative overflow-hidden flex-col mx-auto w-full h-full items-center max-w-[480px] bg-white shadow-[0_35px_60px_-15px_rgba(0,4,0,0.4)]">
                    <Header
                        isAnimating={isAnimating}
                        doctorName={data?.[0]?.user?.doctorName}
                        selectedCount={
                            checkedData?.length
                                ? checkedData?.length
                                : isCopySelected?.length
                        }
                        prevYear={prevYear}
                        prevMonth={prevMonth}
                        open={open}
                        setOpen={setOpen}
                    />
                    {isSelectedConfirm ? (
                        <SeletedConfirm
                            setIsSelectedConfirm={setIsSelectedConfirm}
                        />
                    ) : (
                        <>
                            {checkedData?.length === 0 ? (
                                <>
                                    {data?.length > 3 && (
                                        <div className="absolute bottom-14 left-[46%] z-50 bg-gray-400/30 rounded-lg px-1 py-1">
                                            <p className="text-[12px] font-medium text-gray-700">{`${isIndex}/${isTotalCount}`}</p>
                                        </div>
                                    )}
                                    <List
                                        ref={ref}
                                        isCopySelected={isCopySelected}
                                        setIsCopySelected={setIsCopySelected}
                                        isLoading={isLoading}
                                        setIsMessage={setIsMessage}
                                        setIsPostEnd={setIsPostEnd}
                                        setIsError={setIsError}
                                        setIsAnimating={setIsAnimating}
                                    />
                                    <Footer
                                        handleFetchMore={onHandleData}
                                        dataLegth={data?.length}
                                        setIsModalOpen={setIsModalOpen}
                                    />
                                    <Noti
                                        key={`${JSON.stringify(isPostEnd)}}`}
                                        isOpen={isPostEnd}
                                        setIsPostEnd={setIsPostEnd}
                                        isMessage={isMessage}
                                        isError={isError}
                                        setIsError={setIsError}
                                    />
                                    <SelectedList
                                        open={open}
                                        setOpen={setOpen}
                                    />
                                    <DrawerClickSelected
                                        open={isModalopen}
                                        setOpen={setOpen}
                                        isCopySelected={isCopySelected}
                                        setIsPostEnd={setIsPostEnd}
                                        setIsMessage={setIsMessage}
                                        setIsError={setIsError}
                                        doctorId={doctorId ?? ""}
                                        setIsModalOpen={setIsModalOpen}
                                        setIsSelectedConfirm={
                                            setIsSelectedConfirm
                                        }
                                    />
                                    {/* <ClickSelected
                                open={isModalopen}
                                setOpen={setOpen}
                                isCopySelected={isCopySelected}
                                setIsPostEnd={setIsPostEnd}
                                setIsMessage={setIsMessage}
                                setIsError={setIsError}
                                doctorId={doctorId ?? ""}
                                setIsModalOpen={setIsModalOpen}
                                setIsSelectedConfirm={setIsSelectedConfirm}
                            /> */}
                                </>
                            ) : (
                                <AlreadyList />
                            )}
                        </>
                    )}
                </div>
            </FormProvider>
        </Suspense>
    );
};

export default AiBestCasePage;
