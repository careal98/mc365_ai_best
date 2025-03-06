/* eslint-disable @typescript-eslint/no-explicit-any */
import queryDB from "../../../../lib/db"; // DB 연결 함수
import { NextResponse } from "next/server";

interface UserInfo {
    psEntry: string;
    opDate: string;
    part: string;
    auto_check: number;
    beforeImg: string;
    afterImg: string;
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const {
            year,
            month,
            doctorId,
            offset = 0,
            limit = 3,
        } = Object.fromEntries(url.searchParams.entries());
        // AI가 선정한 사진에 해당하는 수술 정보
        const baseSql = `WITH AB AS (
                            SELECT A.*, I.top1, I.PATH AS AFTER_PATH, I.indate AS after_indate
                            FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO I, 
                                tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI A
                            WHERE CONVERT(NUMERIC, A.Psentry) = I.surgeryID 
                                AND CONVERT(NUMERIC, A.Op_Date) < I.op_data 
                        ), AA AS (
                            SELECT AB.*, I.PATH AS BEFORE_PATH, I.indate AS before_indate
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
                        SELECT * FROM BA 
                        WHERE rn = 1
                        ORDER BY RANK ASC, Op_Date DESC, top1 ASC, after_indate DESC, before_indate DESC
                        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
                        `;
        // const baseSql = `
        //                 SELECT *
        //                 FROM tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI A
        //                 LEFT JOIN tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE M
        //                     ON A.Psentry COLLATE Korean_Wansung_CI_AS = M.고객번호 COLLATE Korean_Wansung_CI_AS
        //                     AND A.Op_Date COLLATE Korean_Wansung_CI_AS = M.OPDATE COLLATE Korean_Wansung_CI_AS
        //                 WHERE A.Year = ${year}
        //                 AND A.Month = ${month}
        //                 AND A.Doctor_Id = '${doctorId}'
        //                 AND EXISTS (
        //                         SELECT TOP 1 * FROM (
        //                             SELECT * FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO AS I
        //                             WHERE CONVERT(NUMERIC, A.Psentry) = I.surgeryID
        //                             AND CONVERT(NUMERIC, A.Op_Date) < I.op_data
        //                         ) AS IB, (
        //                             SELECT * FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO AS I
        //                             WHERE CONVERT(NUMERIC, A.Psentry) = I.surgeryID
        //                             AND CONVERT(NUMERIC, A.Op_Date) >= I.op_data
        //                         ) AS IA
        //                         WHERE IB.top1 = IA.top1
        //                         )
        //                 ORDER BY A.RANK ASC, A.Op_Date DESC
        //                 OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
        //                 `;
        // const baseSql = `
        //                 SELECT DISTINCT A.*
        //                 FROM tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI A
        //                 LEFT JOIN tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE M
        //                     ON A.Psentry COLLATE Korean_Wansung_CI_AS = M.고객번호 COLLATE Korean_Wansung_CI_AS
        //                     AND A.Op_Date COLLATE Korean_Wansung_CI_AS = M.OPDATE COLLATE Korean_Wansung_CI_AS
        //                 JOIN tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO I1
        //                     ON CONVERT(NUMERIC , A.Psentry) = I1.surgeryID
        //                     AND CONVERT(NUMERIC, A.Op_Date) < I1.op_data
        //                 JOIN tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO I2
        //                     ON CONVERT(NUMERIC, A.Psentry) = I2.surgeryID
        //                     AND CONVERT(NUMERIC, A.Op_Date) >= I2.op_data
        //                     AND I1.top1 = I2.top1
        //                 WHERE A.Year = ${year}
        //                     AND A.Month = ${month}
        //                     AND A.Doctor_Id = '${doctorId}'
        //                 ORDER BY A.RANK ASC, A.Op_Date DESC
        //                 OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
        //                 `;
        const results: any[] = await queryDB(baseSql);

        const info: UserInfo[] = results.map((result: any) => ({
            psEntry: result.Psentry,
            opDate: result.Op_Date,
            part: result.Surgical_Site,
            auto_check: result.Auto_Check,
            beforeImg: result.BEFORE_PATH,
            afterImg: result.AFTER_PATH,
        }));

        // AI가 선정한 수술의 psEntry로 후사진의 top1
        // const arrAfterTop1: any[] = await Promise.all(
        //     info.map(async (i1) => {
        //         const sql = `
        //                     SELECT top1 FROM IMAGE_SECTION_INFO
        //                     WHERE surgeryID = ${Number(i1.psEntry)}
        //                         AND op_data > ${Number(i1.opDate)}
        //                     ORDER BY op_data DESC, top1 ASC, indate DESC
        //                     `;
        //         const afterTop1RowsResult = await queryDB(sql);
        //         return afterTop1RowsResult;
        //     })
        // );

        // 후사진의 top1과 일치하는 전사진 유무 파악
        // const arrTop1: any[] = await Promise.all(
        //     arrAfterTop1?.map(async (row: any, rowIdx: number) => {
        //         const topArr: string[] = [];
        //         await Promise.all(
        //             await row?.map(async (r: any) => {
        //                 const sql = `
        //                             SELECT top1 FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
        //                             WHERE surgeryID = ${Number(
        //                                 info?.[rowIdx]?.psEntry
        //                             )}
        //                                 AND op_data <= ${Number(
        //                                     info?.[rowIdx]?.opDate
        //                                 )}
        //                                 AND top1 = ${r?.top1}
        //                             ORDER BY op_data DESC, top1 ASC, indate DESC
        //                             `;
        //                 const top1RowsResult = await queryDB(sql);
        //                 const filteredResults = top1RowsResult.filter(
        //                     (r2: any) => r2?.top1 === r?.top1
        //                 );
        //                 topArr.push(...filteredResults);
        //             })
        //         );
        //         return topArr;
        //     })
        // );

        // top1이 일치하는 전&후사진
        // const imgs = await Promise.all(
        //     info?.map(async (aRow, aRowIdx) => {
        //         const top1 = arrTop1?.[aRowIdx]?.sort(
        //             (a: any, b: any) => a?.top1 - b?.top1
        //         )?.[0]?.top1;
        //         const beforeSql = `
        //                         SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
        //                         WHERE surgeryID = ${Number(aRow?.psEntry)}
        //                             AND op_data <= ${Number(aRow?.opDate)}
        //                             AND top1 = ${top1}
        //                         ORDER BY op_data DESC, top1 ASC, indate DESC
        //                         `;
        //         const afterSql = `
        //                         SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
        //                         WHERE surgeryID = ${Number(aRow?.psEntry)}
        //                             AND op_data > ${Number(aRow?.opDate)}
        //                             AND top1 = ${top1}
        //                         ORDER BY op_data DESC, top1 ASC, indate DESC
        //                         `;
        //         const [beforeImgRowsResult, afterImgRowsResult] =
        //             await Promise.all([queryDB(beforeSql), queryDB(afterSql)]);

        //         return [
        //             beforeImgRowsResult?.[0]?.["PATH"],
        //             afterImgRowsResult?.[0]?.["PATH"],
        //         ];
        //     })
        // );

        // 고객 정보
        const userRows: any[] = await Promise.all(
            info.map(async (i1) => {
                const sql = `
                            SELECT L.고객명, L.수술의, L.메인부위명, L.sex, L.age, S.BEFORE_SIZE, S.AFTER_SIZE, S.BEFORE_WEIGHT, S.AFTER_WEIGHT
                            FROM MAIL_OPE_LIST AS L, MAIL_OPE_SIZE AS S
                            WHERE L.고객번호 = '${i1?.psEntry}'
                                AND L.수술일자 = '${i1?.opDate}'
                                AND L.고객번호 = S.고객번호
                                AND L.수술일자 = S.수술일자
                                AND L.메인부위명 = '${i1?.part}'
                                AND EXISTS (
                                SELECT TOP 1 * FROM (
                                    SELECT * FROM IMAGE_SECTION_INFO AS I
                                    WHERE L.고객번호 = I.surgeryID
                                    AND L.수술일자 >= I.op_data
                                ) AS IB, (
                                    SELECT * FROM IMAGE_SECTION_INFO AS I
                                    WHERE L.고객번호 = I.surgeryID
                                    AND L.수술일자 < I.op_data
                                ) AS IA
                                WHERE IB.top1 = IA.top1
                            )`;
                const userRowsResult = await queryDB(sql);
                return userRowsResult;
            })
        );

        // 베스트 선정 여부
        const isBestRows: any[] = await Promise.all(
            info.map(async (i1) => {
                const sql = `
                            SELECT 고객번호, 수술의ID, OPDATE 
                            FROM MAIL_OPE_BEST_CASE AS M 
                            WHERE 고객번호 = '${i1.psEntry}' 
                                AND OPDATE = '${i1.opDate}' 
                                AND 수술의ID = '${doctorId}'
                            `;
                const isBestRowsResult = await queryDB(sql);
                return isBestRowsResult;
            })
        );

        // 데이터 정리
        const userData: any[] = info?.map((user, userIdx) => ({
            isBest: isBestRows?.[userIdx]?.length !== 0 ? true : false,
            user: {
                psEntry: user.psEntry,
                op_data: user?.opDate,
                name: userRows?.[userIdx]?.[0]?.["고객명"],
                doctorName: userRows?.[userIdx]?.[0]?.["수술의"],
                sex: userRows?.[userIdx]?.[0]?.["sex"],
                age: userRows?.[userIdx]?.[0]?.["age"],
                op_part: userRows?.[userIdx]?.[0]?.["메인부위명"],
                auto_check: user?.auto_check,
            },
            imgs: [user?.beforeImg, user?.afterImg],
            size: {
                before: userRows?.[userIdx]?.[0]?.["BEFORE_SIZE"],
                after: userRows?.[userIdx]?.[0]?.["AFTER_SIZE"],
            },
            weight: {
                before: userRows?.[userIdx]?.[0]?.["BEFORE_WEIGHT"],
                after: userRows?.[userIdx]?.[0]?.["AFTER_WEIGHT"],
            },
        }));

        return NextResponse.json(
            { success: true, list: userData },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err },
            { status: 500 }
        );
    }
}
