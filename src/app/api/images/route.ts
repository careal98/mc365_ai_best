/* eslint-disable @typescript-eslint/no-explicit-any */
import queryDB from "../../../../lib/db"; // DB 연결 함수

type Top1 = {
    top1: number;
};

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const { psEntry, opDate } = Object.fromEntries(
            url.searchParams.entries()
        );
        const confidence1 = 0.7;
        const sql = `
                    SELECT top1 FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                    WHERE surgeryID = ${Number(psEntry)}
                        AND op_data > ${Number(opDate)}
                        AND confidence1 > ${confidence1}
                    ORDER BY op_data DESC, top1 ASC, indate DESC
                    `;
        const afterRowsResult: Top1[] = await queryDB(sql);
        const arrTop1: Top1[] = (
            await Promise.all(
                afterRowsResult?.map(async (row: Top1) => {
                    const sql = `
                                SELECT top1 FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                                WHERE surgeryID = ${Number(psEntry)}
                                    AND op_data <= ${Number(opDate)}
                                    AND confidence1 >= ${confidence1}
                                    AND top1 = ${row?.top1}
                                ORDER BY op_data DESC, top1 ASC, indate DESC
                                `;
                    const top1RowsResult: Top1[] = await queryDB(sql);
                    const filteredResults: Top1[] = top1RowsResult.filter(
                        (r2: Top1) => r2?.top1 === row?.top1
                    );
                    return filteredResults;
                })
            )
        ).flat();

        const imgs = (
            await Promise.all(
                arrTop1
                    ?.sort((a, b) => a?.top1 - b?.top1)
                    ?.map(async (aRow) => {
                        const top1 = aRow?.top1;
                        const beforeSql = `
                                    SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                                    WHERE surgeryID = ${Number(psEntry)}
                                        AND op_data <= ${Number(opDate)}
                                        AND top1 = ${top1}
                                    ORDER BY op_data DESC, top1 ASC, indate DESC
                                    `;
                        const beforeImgRowsResult = await queryDB(beforeSql);
                        const afterSql = `
                                    SELECT TOP 1 PATH FROM tsfmc_mailsystem.dbo.IMAGE_SECTION_INFO
                                    WHERE surgeryID = ${Number(psEntry)}
                                        AND op_data > ${Number(opDate)}
                                        AND top1 = ${top1}
                                    ORDER BY op_data DESC, top1 ASC, indate DESC
                                    `;
                        const afterImgRowsResult = await queryDB(afterSql);
                        const arrImg = beforeImgRowsResult?.map(
                            (before: any, beforeIdx: number) => {
                                return [
                                    before?.["PATH"],
                                    afterImgRowsResult?.[beforeIdx]?.["PATH"],
                                ];
                            }
                        );
                        return arrImg;
                    })
            )
        )?.flat();

        return new Response(JSON.stringify(imgs), { status: 200 });
    } catch (err) {
        console.error("데이터 가져오기 중 에러 발생:", err);
        return new Response(
            JSON.stringify({ message: "데이터 가져오기 에러", error: err }),
            { status: 500 }
        );
    }
}
