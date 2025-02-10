import sql from "mssql";

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

let pool;

export const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log("MSSQL 연결 성공");
        }
        return pool;
    } catch (error) {
        console.error("MSSQL 연결 실패:", error);
        throw error;
    }
};

const queryDB = async (query) => {
    try {
        const pool = await connectDB();
        const request = pool.request();
        const result = await request.query(query);

        return result.recordset;
    } catch (error) {
        console.error("쿼리 실행 실패:", error);
        throw error;
    }
};
export default queryDB;
