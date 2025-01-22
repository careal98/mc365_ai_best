"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Footer, Header, List, Noti, SelectedList} from "@/app/components/ai-best-case";
import { CheckedType, DataType, FormType } from "@/types";
import { FormProvider, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";

const limit = 3;

const AiBestCasePage = () => {
    const searchParams = useSearchParams(); 
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const doctorId = searchParams.get('doctorId');

    const [data, setData] = useState<DataType[]>([]);
    const [firstData, setFirstData] = useState<DataType[]>([]);
    const [checekdData, setCheckedData] = useState<CheckedType[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isPostEnd, setIsPostEnd] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isMessage, setIsMessage] = useState("");
    const [isCopySelected, setIsCopySelected] = useState<CheckedType[]>([]);
    const [isClick, setIsClick] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [open, setOpen] = useState(false);

    const metods = useForm<FormType>({
        defaultValues: {
            isRandom: data?.map((v: DataType) => ({
                isBest:isCopySelected?.find(f => f?.psEntry === v?.user?.psEntry && f?.opDate === v?.user?.op_data) ? true : false,
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

    const handleFetchMore = () => {
        setIsClick(true);
        if (isClick && hasMore && !isLoading) {
            setIsLoading(true);
            fetchData(data.length).then((newData) => {
                if (newData) {
                    setData((prev) => [...prev, ...newData]);
                    if (newData.length < limit) {
                        setHasMore(false);
                    }
                }
            }).finally(() => {
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

    const { ref } = useInView({
        initialInView: false,
        onChange: (inView) => {
            if (inView && hasMore && !isLoading) {
                handleFetchMore();
            }
        },
    });

    useEffect(() => {
        if (!isLoading) {
            setIsLoading(true);
            fetchData(0).then((newData) => {
                if (newData) {
                    setFirstData(newData?.map((n: DataType) => ({
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
                    })));
                    setData(newData);
                    if (newData.length < limit) {
                        setHasMore(false); 
                    }
                }
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, []);

    const onHandleData = () => {
        // if(isCopySelected?.length === 3) {
        //     setIsMessage(
        //         "이미 3개를 선택했습니다. \n취소 후 다시 눌러주세요."
        //     );
        //     setIsPostEnd(true);
        //     setIsError(true);
        //     return
        // }
        handleFetchMore()
    }

    useEffect(() => {
        checkData().then((res) => {
        setCheckedData(res);
        });
    }, [year, month, doctorId]);

    useEffect(() => {
        const aaa = checekdData?.map((v) => ({
            psEntry: v?.psEntry,
            opDate: v?.opDate
        }));
        const bbb = firstData?.map(d => ({
            psEntry: d?.user?.psEntry,
            opDate: d?.user?.op_data
        }))
        const ccc = [...aaa, ...bbb]
        const uniqueArray = Array.from(
            new Map(ccc.map((item) => [JSON.stringify(item), item])).values()
        );
        setIsCopySelected(uniqueArray);
    }, [checekdData, firstData]);

    useEffect(() => {
        reset({
            isRandom: data?.map((v: DataType) => ({
                isBest:isCopySelected?.find(f => f?.psEntry === v?.user?.psEntry && f?.opDate === v?.user?.op_data) ? true : false,
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
                selectedCount={isCopySelected?.length}
                prevYear={prevYear}
                prevMonth={prevMonth}
                open={open}
                setOpen={setOpen}
            />
            <List
                ref={ref}
                isCopySelected={isCopySelected}
                setIsCopySelected={setIsCopySelected}
                selectedData={checekdData}
                isLoading={isLoading}
                setIsMessage={setIsMessage}
                setIsPostEnd={setIsPostEnd}
                setIsError={setIsError}
                setIsAnimating={setIsAnimating}
            />
            <Footer
                dataLegth={data?.length}
                isCopySelected={isCopySelected}
                handleFetchMore={onHandleData}
                setIsPostEnd={setIsPostEnd}
                setIsMessage={setIsMessage}
                setIsError={setIsError}
                doctorId={doctorId ?? ""}
                setOpen={setOpen}
            />
            <Noti
                key={`${JSON.stringify(isPostEnd)}}`}
                isOpen={isPostEnd}
                setIsPostEnd={setIsPostEnd}
                isMessage={isMessage}
                isError={isError}
                setIsError={setIsError}
            />
            <SelectedList open={open} setOpen={setOpen} />
            </div>
        </FormProvider>
        </Suspense>
    );
};

export default AiBestCasePage;
