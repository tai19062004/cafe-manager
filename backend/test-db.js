import oracledb from 'oracledb';
import 'dotenv/config';

async function testConnection() {
  console.log('🔄 Đang kiểm tra kết nối tới Oracle Database...');
  console.log(`👤 User: ${process.env.ORACLE_USER}`);
  console.log(`🔗 Connect String: ${process.env.ORACLE_CONNECT_STRING}`);

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING
    });

    console.log('✅ Kết nối Oracle thành công!');

    // Test query SYSDATE
    const sysdateRes = await connection.execute(`SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') AS CURRENT_TIME FROM DUAL`);
    console.log(`🕒 Thời gian hiện tại trên Oracle: ${sysdateRes.rows[0][0]}`);

    // Kiểm tra sự tồn tại của 8 bảng
    const tables = ['CATEGORY', 'PRODUCT', 'CUSTOMER', 'EMPLOYEE', 'CAFE_TABLE', 'ORDERS', 'ORDER_DETAIL', 'PAYMENT'];
    console.log('\n📊 Kiểm tra 8 bảng trong schema CAFE:');

    for (const table of tables) {
      try {
        const countRes = await connection.execute(`SELECT COUNT(*) AS CNT FROM ${table}`);
        console.log(`  - Bảng [${table}]: TỒN TẠI (${countRes.rows[0][0]} bản ghi)`);
      } catch (tblErr) {
        console.log(`  - Bảng [${table}]: ⚠️ Lỗi hoặc chưa tồn tại (${tblErr.message})`);
      }
    }

    console.log('\n🎉 Kiểm tra hoàn tất! Database đã sẵn sàng.');

  } catch (err) {
    console.error('❌ Lỗi kết nối Oracle:', err.message);
    console.error('\nGợi ý khắc phục:');
    console.error('1. Kiểm tra lại password trong file backend/.env');
    console.error('2. Kiểm tra Oracle Listener và Service FREEPDB1 đang chạy');
    console.error('3. Thử kết nối bằng SQL*Plus hoặc SQL Developer: CAFE/password@localhost:1521/FREEPDB1');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Lỗi khi đóng kết nối:', err);
      }
    }
  }
}

testConnection();
