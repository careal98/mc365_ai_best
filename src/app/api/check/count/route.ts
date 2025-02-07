/* eslint-disable @typescript-eslint/no-explicit-any */
import queryDB from "../../../../../lib/db";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const { year, month, doctorId } = Object.fromEntries(
            url.searchParams.entries()
        );
        const sql = `SELECT 고객번호 as psEntry, OPDATE as opDate
                    FROM tsfmc_mailsystem.dbo.MAIL_OPE_BEST_CASE
                    WHERE 수술의ID = '${doctorId}'
                        AND YEAR(last_updated) = ${year}
                        AND MONTH(last_updated) = ${month}
                    `;
        const results = await queryDB(sql);
        return new Response(JSON.stringify(results), { status: 200 });
    } catch {}
}
