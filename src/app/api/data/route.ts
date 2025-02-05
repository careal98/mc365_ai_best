/* eslint-disable @typescript-eslint/no-explicit-any */
import queryDB from "../../../../lib/db"; // DB 연결 함수

interface UserInfo {
    psEntry: string;
    opDate: string;
    part: string;
}

export async function GET(req: Request) {
    try {
        const start = Date.now();
        const url = new URL(req.url);
        const {
            year,
            month,
            doctorId,
            offset = 0,
            limit = 3,
        } = Object.fromEntries(url.searchParams.entries());
        const confidence1 = 0.7;
        // AI가 선정한 사진에 해당하는 수술 정보
        const baseSql = `
                        SELECT DISTINCT A.*
                        FROM 
                            tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI A
                        INNER JOIN 
                            tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO I1
                            ON CONVERT(VARCHAR, A.Psentry) = I1.surgeryID
                            AND A.Op_Date >= I1.op_data
                        INNER JOIN 
                            tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO I2
                            ON CONVERT(VARCHAR, A.Psentry) = I2.surgeryID
                            AND A.Op_Date < I2.op_data
                        LEFT JOIN 
                            tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE M
                            ON A.Psentry COLLATE Korean_Wansung_CI_AS = M.고객번호 COLLATE Korean_Wansung_CI_AS
                            AND A.Op_Date COLLATE Korean_Wansung_CI_AS = M.OPDATE COLLATE Korean_Wansung_CI_AS
                        WHERE 
                            A.Year = ${year}
                            AND A.Month = ${month}
                            AND A.Doctor_Id = '${doctorId}'
                            AND M.고객번호 IS NULL
                            AND I1.top1 = I2.top1
                        ORDER BY A.RANK DESC, A.Op_Date DESC 
                        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
                        `;
        const results: any[] = await queryDB(baseSql);
        // QueryResult 타입에서 rows로 데이터 추출
        // const rows: any = 'rows' in results ? results.rows : [];
        const info: UserInfo[] = results.map((result: any) => ({
            psEntry: result.Psentry,
            opDate: result.Op_Date,
            part: result.Surgical_Site,
        }));
        const end1 = Date.now();
        console.dir(`1API 처리 시간: ${end1 - start}ms`);
        // AI가 선정한 수술의 psEntry로 사진 추출
        const start2 = Date.now();
        const arrAfterTop1: any[] = await Promise.all(
            info.map(async (i1) => {
                const sql = `
                            SELECT top1 FROM IMAGE_SECTION_INFO
                            WHERE surgeryID = ${Number(i1.psEntry)}
                                AND confidence1 >= ${confidence1}
                                AND op_data > ${Number(i1.opDate)}
                            ORDER BY top1
                            `;
                const afterTop1RowsResult = await queryDB(sql);
                return afterTop1RowsResult;
            })
        );
        const end2 = Date.now();
        console.dir(`2API 처리 시간: ${end2 - start2}ms`);
        const start3 = Date.now();
        const arrTop1: any[] = await Promise.all(
            arrAfterTop1?.map(async (row: any, rowIdx: number) => {
                const topArr: string[] = [];
                await Promise.all(
                    await row?.map(async (r: any) => {
                        const sql = `
                                SELECT top1 FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                                WHERE surgeryID = ${Number(
                                    info?.[rowIdx]?.psEntry
                                )}
                                    AND op_data <= ${Number(
                                        info?.[rowIdx]?.opDate
                                    )}
                                    AND confidence1 >= ${confidence1}
                                    AND top1 = ${r?.top1}
                                `;
                        const top1RowsResult = await queryDB(sql);
                        const filteredResults = top1RowsResult.filter(
                            (r2: any) => r2?.top1 === r?.top1
                        );
                        topArr.push(...filteredResults);
                        return top1RowsResult;
                    })
                );
                return topArr;
            })
        );
        const end3 = Date.now();
        console.dir(`3API 처리 시간: ${end3 - start3}ms`);
        const imgs = await Promise.all(
            info?.map(async (aRow, aRowIdx) => {
                const beforeImgs: string[] = [];
                const afterImgs: string[] = [];
                const top1 = arrTop1?.[aRowIdx]?.[0]?.top1;
                // console.dir(arrTop1);
                const beforeSql = `
                                SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                                WHERE surgeryID = ${Number(aRow?.psEntry)}
                                    AND op_data <= ${Number(aRow?.opDate)}
                                    AND top1 = ${top1}
                                `;
                const beforeImgRowsResult = await queryDB(beforeSql);
                const afterSql = `
                                    SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                                    WHERE surgeryID = ${Number(aRow?.psEntry)}
                                        AND op_data > ${Number(aRow?.opDate)}
                                        AND top1 = ${top1}
                                    `;
                const afterImgRowsResult = await queryDB(afterSql);
                beforeImgs.push(beforeImgRowsResult?.[0]?.["PATH"]);
                afterImgs.push(afterImgRowsResult?.[0]?.["PATH"]);
                // arrTop1?.[aRowIdx]?.map(
                //     async (row: any, rowIdx: number) => {
                //         const beforeSql = `
                //                     SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                //                     WHERE surgeryID = ${Number(
                //                         aRow.psEntry
                //                     )}
                //                         AND op_data <= ${Number(
                //                             aRow.opDate
                //                         )}
                //                         AND top1 = ${row.top1}
                //                     `;
                //         const beforeImgRowsResult = await queryDB(
                //             beforeSql
                //         );
                //         const afterSql = `
                //                     SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                //                     WHERE surgeryID = ${Number(
                //                         aRow.psEntry
                //                     )}
                //                         AND op_data > ${Number(aRow.opDate)}
                //                         AND top1 = ${row.top1}
                //                     `;
                //         const afterImgRowsResult = await queryDB(afterSql);
                //         const beforeImgRows: any = beforeImgRowsResult;
                //         const afterImgRows: any = afterImgRowsResult;
                //         beforeImgs.push(
                //             [...beforeImgRows?.map((v: any) => v)]?.[0]?.[
                //                 "PATH"
                //             ]
                //         );
                //         afterImgs.push(
                //             afterImgRows?.[aRowIdx]?.[rowIdx]?.["PATH"]
                //         );
                //     }
                // )

                return { beforeImgs, afterImgs };
            })
            // const afterRows: any[] = await Promise.all(
        );
        const start4 = Date.now();
        console.dir(`4API 처리 시간: ${start4 - end3}ms`);
        //     info.map(async (i1) => {
        //         const sql = `
        //                     SELECT TOP 1 PATH, top1 FROM IMAGE_SECTION_INFO
        //                     WHERE surgeryID = ${Number(i1.psEntry)}
        //                         AND confidence1 >= ${confidence1}
        //                         AND op_data > ${Number(i1.opDate)}
        //                     ORDER BY op_data, top1
        //                     `;
        //         const afterRowsResult = await queryDB(sql);
        //         return afterRowsResult;
        //     })
        // );
        // const imgs = await Promise.all(
        //     info.map(async (aRow, aRowIdx) => {
        //         const beforeImgs: string[] = [];
        //         const afterImgs: string[] = [];
        //         await Promise.all(
        //             afterRows?.[aRowIdx]?.map(
        //                 async (row: any, rowIdx: number) => {
        //                     const sql = `
        //                                 SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
        //                                 WHERE surgeryID = ${Number(
        //                                     aRow.psEntry
        //                                 )}
        //                                     AND op_data <= ${Number(
        //                                         aRow.opDate
        //                                     )}
        //                                     AND top1 = ${row.top1}
        //                                 `;
        //                     const imgRowsResult = await queryDB(sql);
        //                     const imgRows: any = imgRowsResult;
        //                     if (imgRows.length > 0) {
        //                         beforeImgs.push(
        //                             [...imgRows?.map((v: any) => v)]?.[0]?.[
        //                                 "PATH"
        //                             ]
        //                         );
        //                         afterImgs.push(
        //                             afterRows?.[aRowIdx]?.[rowIdx]?.["PATH"]
        //                         );
        //                     }
        //                 }
        //             )
        //         );
        //         return { beforeImgs, afterImgs };
        //     })
        // );

        // 고객 정보
        const userRows: any[] = await Promise.all(
            info.map(async (i1) => {
                const sql = `
                            SELECT L.고객명, L.수술의, L.메인부위명, L.sex, L.age, S.BEFORE_SIZE, S.AFTER_SIZE, S.BEFORE_WEIGHT, S.AFTER_WEIGHT
                            FROM MAIL_OPE_LIST AS L, MAIL_OPE_SIZE AS S
                            WHERE L.고객번호 = '${i1.psEntry}'
                                AND L.수술일자 = '${i1.opDate}'
                                AND L.고객번호 = S.고객번호
                                AND L.수술일자 = S.수술일자
                                AND L.메인부위명 = '${i1.part}'
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
                //  const sql = `
                // SELECT L.고객명, L.수술의, L.메인부위명, L.sex, L.age, S.BEFORE_SIZE, S.AFTER_SIZE, S.BEFORE_WEIGHT, S.AFTER_WEIGHT
                // FROM MAIL_OPE_LIST AS L, MAIL_OPE_SIZE AS S
                // WHERE L.고객번호 = '${i1.psEntry}'
                //     AND L.수술일자 = '${i1.opDate}'
                //     AND L.메인부위명 = '${i1.part}'
                //     AND L.고객번호 = S.고객번호
                //     AND L.수술일자 = S.수술일자
                //     AND L.메인부위명 = S.메인부위명
                //     AND EXISTS (
                //     SELECT TOP 1 * FROM (
                //         SELECT * FROM IMAGE_SECTION_INFO AS I
                //         WHERE L.고객번호 = I.surgeryID
                //         AND L.수술일자 >= I.op_data
                //         AND confidence1 >= ${confidence1}
                //         AND (
                //             (I.section = '전신' OR I.section = 'null' OR I.section IS NULL)
                //             OR (I.section = '엉덩이' AND (L.메인부위명 = '힙업' OR L.메인부위명 = '힙'))
                //             OR (I.section = '러브핸들' AND L.메인부위명 = '복부')
                //             OR (I.section = '허파고리' AND L.메인부위명 = '허벅지')
                //             OR L.메인부위명 = I.section COLLATE Korean_Wansung_CI_AS
                //         )
                //     ) AS IB, (
                //         SELECT * FROM IMAGE_SECTION_INFO AS I
                //         WHERE L.고객번호 = I.surgeryID
                //         AND L.수술일자 < I.op_data
                //         AND confidence1 >= ${confidence1}
                //         AND (
                //             (I.section = '전신' OR I.section = 'null' OR I.section IS NULL)
                //             OR (I.section = '엉덩이' AND (L.메인부위명 = '힙업' OR L.메인부위명 = '힙'))
                //             OR (I.section = '러브핸들' AND L.메인부위명 = '복부')
                //             OR (I.section = '허파고리' AND L.메인부위명 = '허벅지')
                //             OR L.메인부위명 = I.section COLLATE Korean_Wansung_CI_AS
                //         )
                //     ) AS IA
                //     WHERE IB.top1 = IA.top1
                // )`;
                const userRowsResult = await queryDB(sql);
                return userRowsResult;
            })
        );

        const start5 = Date.now();
        console.dir(`5API 처리 시간: ${start5 - start4}ms`);
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

        const start6 = Date.now();
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
            },
            imgs: {
                beforeImgs: imgs?.[userIdx]?.beforeImgs,
                afterImgs: imgs?.[userIdx]?.afterImgs,
            },
            size: {
                before: userRows?.[userIdx]?.[0]?.["BEFORE_SIZE"],
                after: userRows?.[userIdx]?.[0]?.["AFTER_SIZE"],
            },
            weight: {
                before: userRows?.[userIdx]?.[0]?.["BEFORE_WEIGHT"],
                after: userRows?.[userIdx]?.[0]?.["AFTER_WEIGHT"],
            },
        }));

        const start7 = Date.now();
        console.dir(`6API 처리 시간: ${start7 - start6}ms`);
        return new Response(JSON.stringify(userData), { status: 200 });
    } catch (err) {
        console.error("데이터 가져오기 중 에러 발생:", err);
        return new Response(
            JSON.stringify({ message: "데이터 가져오기 에러", error: err }),
            { status: 500 }
        );
    }
}
