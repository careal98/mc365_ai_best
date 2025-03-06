/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import queryDB from "../../../../lib/db";

export const config = {
    runtime: "nodejs",
    maxDuration: 30,
};

export async function POST(req: Request) {
    try {
        const bestData = await req.json();
        const best: any[] = bestData?.[0]?.selected;
        const unBest: any[] = bestData?.[1]?.unselected;

        // 선택한 수술이 베스트 케이스에 있는 데이터 조회
        const checkDatas: any[] = await Promise.all(
            best.map(async (v) => {
                const checkSql = `
                    SELECT 고객번호, 수술의ID, OPDATE 
                    FROM MAIL_OPE_BEST_CASE 
                    WHERE 수술의ID = '${v.doctorId}' 
                        AND 고객번호 = '${v.psEntry}' 
                        AND OPDATE = '${v.op_date}'`;
                return await queryDB(checkSql);
            })
        );

        // 체크한 고객이 있으면 업데이트, 없으면 삽입
        const checks: any[] = best.map((b1, b1Idx) => {
            const dobleCheck =
                checkDatas?.[b1Idx]?.length !== 0
                    ? checkDatas?.[b1Idx]?.map((b2: any) => ({
                          psEntry: b2?.고객번호 || b1?.psEntry,
                          doctorId: b2?.수술의ID || b1?.doctorId,
                          op_date: b2?.OPDATE || b1?.op_date,
                          isState:
                              b2?.고객번호 && b2?.수술의ID && b2?.OPDATE
                                  ? "UPDATE"
                                  : "INSERT",
                      }))
                    : [
                          {
                              psEntry: b1?.psEntry,
                              doctorId: b1?.doctorId,
                              op_date: b1?.op_date,
                              isState: "INSERT",
                          },
                      ];
            return dobleCheck;
        });

        // ✅ reduce를 사용하여 순차적으로 SQL 실행
        await checks.reduce(async (prevPromise, c) => {
            await prevPromise;
            const checkedData = c?.[0];
            const isState = checkedData?.isState;
            let sql;

            if (isState === "INSERT") {
                sql = `INSERT INTO MAIL_OPE_BEST_CASE (고객번호, 수술의ID, last_updated, OPDATE, device)
                       VALUES ('${checkedData.psEntry}', '${checkedData.doctorId}', SYSDATETIME(), '${checkedData.op_date}', 1)`;
            } else {
                sql = `UPDATE MAIL_OPE_BEST_CASE SET last_updated = SYSDATETIME(), device = 1
                       WHERE 고객번호 = '${checkedData.psEntry}' 
                       AND 수술의ID = '${checkedData.doctorId}' 
                       AND OPDATE = '${checkedData.op_date}'`;
            }

            return queryDB(sql);
        }, Promise.resolve());

        // 미선택한 수술이 베스트 케이스에 있는지 확인
        const unCheckDatas: any[] = await Promise.all(
            unBest.map(async (v) => {
                const checkSql = `SELECT 고객번호, 수술의ID, OPDATE 
                                  FROM MAIL_OPE_BEST_CASE 
                                  WHERE 수술의ID = '${v.doctorId}' 
                                      AND 고객번호 = '${v.psEntry}' 
                                      AND OPDATE = '${v.op_date}'`;
                return await queryDB(checkSql);
            })
        );

        // 미선택한 데이터가 있으면 삭제
        const unChecks = unBest.map((b1, b1Idx) => {
            const dobleUnCheck =
                unCheckDatas?.[b1Idx]?.length !== 0
                    ? unCheckDatas?.[b1Idx]?.map((b2: any) => ({
                          psEntry: b2?.고객번호 || b1?.psEntry,
                          doctorId: b2?.수술의ID || b1?.doctorId,
                          op_date: b2?.OPDATE || b1?.op_date,
                          isState:
                              b2?.고객번호 && b2?.수술의ID && b2?.OPDATE
                                  ? "DELETE"
                                  : "NOTHING",
                      }))
                    : [
                          {
                              psEntry: b1?.psEntry,
                              doctorId: b1?.doctorId,
                              op_date: b1?.op_date,
                              isState: "NOTHING",
                          },
                      ];
            return dobleUnCheck;
        });

        // ✅ reduce를 사용하여 순차적으로 삭제 SQL 실행
        await unChecks.reduce(async (prevPromise, c) => {
            await prevPromise;
            const unCheckedData = c?.[0];
            const isState = unCheckedData?.isState;
            let sql;

            if (isState === "DELETE") {
                sql = `DELETE FROM MAIL_OPE_BEST_CASE
                       WHERE 수술의ID = '${unCheckedData.doctorId}' 
                       AND 고객번호 = '${unCheckedData.psEntry}' 
                       AND OPDATE = '${unCheckedData.op_date}'`;
                return queryDB(sql);
            }
        }, Promise.resolve());

        return NextResponse.json({ success: true, list: bestData });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error },
            { status: 500 }
        );
    }
}
