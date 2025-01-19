import queryDB from "../../../../lib/db";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const { year, month, doctorId } = Object.fromEntries(url.searchParams.entries());
    try {
      const sql = ` SELECT * 
                FROM tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE AS M, tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE_AI AS A
                WHERE A.Doctor_Id COLLATE Korean_Wansung_CI_AS = '${doctorId}' COLLATE Korean_Wansung_CI_AS
                AND A.[Year] = ${year}
                AND A.[Month] = ${month} AND A.Psentry COLLATE Korean_Wansung_CI_AS = M.고객번호 COLLATE Korean_Wansung_CI_AS 
                AND A.Doctor_Id COLLATE Korean_Wansung_CI_AS = M.수술의ID COLLATE Korean_Wansung_CI_AS 
                `;
        const results = await queryDB(sql);

        return new Response(JSON.stringify(results), { status: 200 });
    } catch {}
};