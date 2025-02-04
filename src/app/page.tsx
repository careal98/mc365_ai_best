"use client";

import dynamic from "next/dynamic";

const AiBestCasePage = dynamic(() => import("./AiBestCasePage"), {
    ssr: false,
});

export default AiBestCasePage;
