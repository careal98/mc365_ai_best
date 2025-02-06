/* eslint-disable @typescript-eslint/no-explicit-any */
import queryDB from "../../../../../lib/db"; // DB 연결 함수

export async function GET(req: Request) {
    try {
        const confidence1 = 0.7;
        const url = new URL(req.url);
        const { year, month, doctorId } = Object.fromEntries(
            url.searchParams.entries()
        );
        // AI가 선정한 사진에 해당하는 수술 카운트
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
                            AND I1.confidence1 >= ${confidence1}
                            AND I2.confidence1 >= ${confidence1}
                        ORDER BY A.RANK DESC, A.Op_Date DESC 
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
