import oracledb from 'oracledb';
import 'dotenv/config';

// Ensure query results return JS objects instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Helper to convert Oracle uppercase column keys to lowercase
export function toLowerKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(toLowerKeys);
  const newObj = {};
  for (const key of Object.keys(obj)) {
    newObj[key.toLowerCase()] = toLowerKeys(obj[key]);
  }
  return newObj;
}

// Initialize database connection pool
export async function initPool() {
  try {
    await oracledb.createPool({
      user: process.env.ORACLE_USER || 'CAFE',
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/FREEPDB1',
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 2
    });
    console.log('✅ Oracle Database Connection Pool initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Oracle Database Connection Pool:', err.message);
    throw err;
  }
}

// Get a connection from pool
export async function getConnection() {
  return await oracledb.getConnection();
}

// Execute query with auto connection management
export async function execute(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const queryOptions = {
      autoCommit: true,
      ...options
    };
    const result = await connection.execute(sql, binds, queryOptions);
    if (result.rows) {
      result.rows = toLowerKeys(result.rows);
    }
    return result;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing Oracle connection:', closeErr);
      }
    }
  }
}

// Check if a column is an IDENTITY column in Oracle
export async function isIdentityColumn(connection, tableName, columnName) {
  try {
    const res = await connection.execute(
      `SELECT IDENTITY_COLUMN FROM USER_TAB_COLS 
       WHERE TABLE_NAME = UPPER(:tableName) AND COLUMN_NAME = UPPER(:columnName)`,
      { tableName, columnName }
    );
    if (res.rows && res.rows.length > 0) {
      const val = res.rows[0].IDENTITY_COLUMN || res.rows[0].identity_column;
      return val === 'YES';
    }
    return false;
  } catch (err) {
    return false;
  }
}

// Helper to get next ID if table does not use IDENTITY
export async function getNextId(connection, tableName, idColumn) {
  const res = await connection.execute(
    `SELECT NVL(MAX(${idColumn}), 0) + 1 AS NEXT_ID FROM ${tableName}`
  );
  const row = res.rows[0];
  return row.NEXT_ID || row.next_id || 1;
}

// Close connection pool on application exit
export async function closePool() {
  try {
    await oracledb.getPool().close(10);
    console.log('Oracle Connection Pool closed.');
  } catch (err) {
    console.error('Error closing Oracle Connection Pool:', err.message);
  }
}

const db = {
  initPool,
  getConnection,
  execute,
  isIdentityColumn,
  getNextId,
  toLowerKeys,
  closePool
};

export default db;
