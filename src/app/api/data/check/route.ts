/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import queryDB from "../../../../../lib/db"; // DB 연결 함수

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const { year, month, doctorId } = Object.fromEntries(
            url.searchParams.entries()
        );
        // AI가 선정한 사진에 해당하는 수술 카운트
        const baseSql = `
                        WITH AB AS (
                            SELECT A.*, I.top1, I.PATH AS AFTER_PATH, indate AS after_indate 
                            FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO I, 
                                tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI A
                            WHERE CONVERT(NUMERIC, A.Psentry) = I.surgeryID 
                                AND CONVERT(NUMERIC, A.Op_Date) < I.op_data 
                        ), AA AS (
                            SELECT AB.*, I.PATH AS BEFORE_PATH, indate AS before_indate
                            FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO I, AB
                            WHERE AB.Psentry = I.surgeryID 
                                AND CONVERT(NUMERIC, AB.Op_Date) >= I.op_data 
                                AND AB.top1 = I.top1
                        ), FBA AS (
                            SELECT AA.* FROM tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI A 
                            LEFT JOIN AA
                            ON AA.Psentry = A.Psentry AND AA.Op_Date = A.Op_Date
                        ), BA AS (
                            SELECT *, ROW_NUMBER() OVER (PARTITION BY RANK ORDER BY RANK ASC, Op_Date DESC, top1 ASC, after_indate DESC, before_indate DESC) AS rn
                            FROM FBA
                            WHERE Year = ${year}
                            AND Month = ${month}
                            AND Doctor_Id = '${doctorId}'
                        )
                        SELECT COUNT(*) AS TotalCount FROM BA 
                        WHERE rn = 1
                        `;
        const results: any[] = await queryDB(baseSql);
        return NextResponse.json({ success: true, count: results });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err },
            { status: 500 }
        );
    }
}
