/* eslint-disable @typescript-eslint/no-explicit-any */
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

        // 선택한 수술이 베스트 케이스에 있는 데이터
        const checkDatas: any[] = await Promise.all(
            best.map(async (v) => {
                const checkSql = `
                                SELECT 고객번호, 수술의ID, OPDATE 
                                FROM MAIL_OPE_BEST_CASE 
                                WHERE 수술의ID = '${v.doctorId}' 
                                    AND 고객번호 = '${v.psEntry}' 
                                    AND OPDATE = '${v.op_date}'`;
                const checkRowsResult = await queryDB(checkSql);
                return checkRowsResult;
            })
        );
        // 체크한 고객이 있으면 업데이트
        const checks: any[] = best?.map((b1, b1Idx) => {
            const dobleCheck =
                checkDatas?.[b1Idx]?.length !== 0
                    ? checkDatas?.[b1Idx]?.map((b2: any) => ({
                          psEntry: b2?.고객번호 ? b2?.고객번호 : b1?.psEntry,
                          doctorId: b2?.수술의ID ? b2?.수술의ID : b1?.doctorId,
                          op_date: b2?.OPDATE ? b2?.OPDATE : b1?.op_date,
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
        checks?.map(async (c) => {
            let sql;
            const checkedData = c?.[0];
            const isState = checkedData?.isState;
            if (isState === "INSERT") {
                sql = `INSERT INTO MAIL_OPE_BEST_CASE (고객번호, 수술의ID, last_updated, OPDATE, device)
            VALUES ('${checkedData.psEntry}', '${checkedData.doctorId}', SYSDATETIME(), '${checkedData.op_date}', 1)`;
            } else {
                sql = `UPDATE MAIL_OPE_BEST_CASE SET last_updated = SYSDATETIME(), device = 1
            WHERE 고객번호 = '${checkedData.psEntry}' AND 수술의ID = '${checkedData.doctorId}' AND OPDATE = '${checkedData.op_date}'`;
            }
            const checkedPostResult = await queryDB(sql);
            return checkedPostResult;
        });
        // 미선택한 수술이 베스트 케이스에 있는지 확인
        const unCheckDatas: any[] = await Promise.all(
            unBest.map(async (v) => {
                const checkSql = `SELECT 고객번호, 수술의ID, OPDATE 
                                FROM MAIL_OPE_BEST_CASE 
                                WHERE 수술의ID = '${v.doctorId}' 
                                    AND 고객번호 = '${v.psEntry}' 
                                    AND OPDATE = '${v.op_date}'`;
                const checkRowsResult = await queryDB(checkSql);
                return checkRowsResult;
            })
        );
        // 미체크한 고객이 있으면 삭제
        const unChecks = unBest?.map((b1, b1Idx) => {
            const dobleUnCheck =
                unCheckDatas?.[b1Idx]?.length !== 0
                    ? unCheckDatas?.[b1Idx]?.map((b2: any) => ({
                          psEntry: b2?.고객번호 ? b2?.고객번호 : b1?.psEntry,
                          doctorId: b2?.수술의ID ? b2?.수술의ID : b1?.doctorId,
                          op_date: b2?.OPDATE ? b2?.OPDATE : b1?.op_date,
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
        unChecks?.map(async (c) => {
            let sql;
            const unCheckedData = c?.[0];
            const isState = unCheckedData?.isState;
            if (isState === "DELETE") {
                sql = `DELETE FROM MAIL_OPE_BEST_CASE
                    WHERE 수술의ID = '${unCheckedData.doctorId}' 
                        AND 고객번호 = '${unCheckedData.psEntry}' 
                        AND OPDATE = '${unCheckedData.op_date}'`;
            }
            const unCheckedPostResult = await queryDB(sql);
            return unCheckedPostResult;
        });

        return new Response(JSON.stringify(bestData), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(error), { status: 500 });
    }
}
