"use client";

import { useSearchParams } from "next/navigation";

const SearchParamsComponent = () => {
    const searchParams = useSearchParams();
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const doctorId = searchParams.get('doctorId');

    return {year, month, doctorId}
};

export default SearchParamsComponent;
