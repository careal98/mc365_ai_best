import queryDB from "../../../../../lib/db";
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const { year, month, doctorId} = Object.fromEntries(url.searchParams.entries());
        const sql = ` SELECT 고객번호 as psEntry 
                FROM tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE AS M, tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI AS A
                WHERE A.Doctor_Id COLLATE Korean_Wansung_CI_AS = '${doctorId}' COLLATE Korean_Wansung_CI_AS
                AND A.[Year] = ${year}
                AND A.[Month] = ${month} AND A.Psentry COLLATE Korean_Wansung_CI_AS = M.고객번호 COLLATE Korean_Wansung_CI_AS 
                AND A.Doctor_Id COLLATE Korean_Wansung_CI_AS = M.수술의ID COLLATE Korean_Wansung_CI_AS            
                AND EXISTS (
                    SELECT 1 
                    FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO AS I
                    WHERE A.Psentry = I.surgeryID
                    AND A.Op_Date >= I.op_data
                    AND A.Surgical_Site COLLATE Korean_Wansung_CI_AS = I.section COLLATE Korean_Wansung_CI_AS
                )
                AND EXISTS (
                    SELECT 1 
                    FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO AS I
                    WHERE A.Psentry = I.surgeryID
                    AND A.Op_Date < I.op_data
                    AND A.Surgical_Site COLLATE Korean_Wansung_CI_AS = I.section COLLATE Korean_Wansung_CI_AS
                )`;
        const results = await queryDB(sql);
        // return NextResponse.json({ count: results?.length });
        return new Response(JSON.stringify(results), { status: 200 });
    } catch {}
};