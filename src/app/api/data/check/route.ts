/* eslint-disable @typescript-eslint/no-explicit-any */
import queryDB from "../../../../../lib/db"; // DB 연결 함수

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const { year, month, doctorId } = Object.fromEntries(
            url.searchParams.entries()
        );
        // AI가 선정한 사진에 해당하는 수술 카운트
        const baseSql = `
        SELECT * 
        FROM tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI A
        WHERE Year = ${Number(year)} 
            AND Month = ${Number(month)}
            AND Doctor_Id = '${doctorId}'
            AND EXISTS (
                SELECT 1 
                FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO AS I
                WHERE CONVERT(VARCHAR, A.Psentry) = I.surgeryID
                AND A.Op_Date >= I.op_data
                AND A.Surgical_Site COLLATE Korean_Wansung_CI_AS = I.section COLLATE Korean_Wansung_CI_AS
            )
            AND EXISTS (
                SELECT 1 
                FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO AS I
                WHERE CONVERT(VARCHAR, A.Psentry) = I.surgeryID
                AND A.Op_Date < I.op_data
                AND A.Surgical_Site COLLATE Korean_Wansung_CI_AS = I.section COLLATE Korean_Wansung_CI_AS
            )
        ORDER BY RANK ASC, Op_Date DESC
        `;
        const results: any[] = await queryDB(baseSql);
        return new Response(JSON.stringify(results.length), { status: 200 });
    } catch (err) {
        console.error("데이터 가져오기 중 에러 발생:", err);
        return new Response(
            JSON.stringify({ message: "데이터 가져오기 에러", error: err }),
            { status: 500 }
        );
    }
}
