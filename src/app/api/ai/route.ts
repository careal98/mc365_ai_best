/* eslint-disable @typescript-eslint/no-explicit-any */
import queryDB from "../../../../lib/db";

export async function POST(req: Request) {
    try {
        const bestData = await req.json();
        const best: any[] = bestData?.[0]?.selected;
        const unBest: any[] = bestData?.[1]?.unselected;

        // 선택한 수술이 베스트 케이스에 있는 데이터
        best?.map(async (b) => {
            const checkedData = b?.[0];
            const sql = `UPDATE MAIL_OPE_BEST_CASE_AI SET Auto_Check = 1
            WHERE 고객번호 = '${checkedData.psEntry}' AND 수술의ID = '${checkedData.doctorId}' AND OPDATE = '${checkedData.op_date}'`;
            await queryDB(sql);
        });
        // 미체크한 고객이 있으면 삭제
        unBest?.map(async (c) => {
            const unCheckedData = c?.[0];
            const sql = `UPDATE MAIL_OPE_BEST_CASE_AI SET Auto_Check = 0
            WHERE 고객번호 = '${unCheckedData.psEntry}' AND 수술의ID = '${unCheckedData.doctorId}' AND OPDATE = '${unCheckedData.op_date}'`;
            await queryDB(sql);
        });

        return new Response(JSON.stringify(bestData), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(error), { status: 500 });
    }
}
