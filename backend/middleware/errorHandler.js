// Centralized Error Handling Middleware
export default function errorHandler(err, req, res, next) {
  console.error('❌ Server Error:', err);

  // Default response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';

  // Oracle-specific error codes handling
  if (err.errorNum || (err.message && err.message.startsWith('ORA-'))) {
    const errorNum = err.errorNum;
    const errorMsg = err.message || '';

    if (errorNum === 1 || errorMsg.includes('ORA-00001')) {
      // Unique constraint violated
      statusCode = 400;
      message = 'Dữ liệu đã tồn tại trong hệ thống (vi phạm ràng buộc UNIQUE).';
    } else if (errorNum === 2292 || errorMsg.includes('ORA-02292')) {
      // Integrity constraint violated - child record found
      statusCode = 400;
      message = 'Không thể xóa hoặc thay đổi dữ liệu này vì đang có dữ liệu liên quan ở bảng khác.';
    } else if (errorNum === 2291 || errorMsg.includes('ORA-02291')) {
      // Integrity constraint violated - parent key not found
      statusCode = 400;
      message = 'Dữ liệu liên kết không tồn tại (vi phạm khóa ngoại Foreign Key).';
    } else if (errorNum === 1400 || errorMsg.includes('ORA-01400')) {
      // Cannot insert NULL
      statusCode = 400;
      message = 'Thiếu thông tin bắt buộc khi lưu dữ liệu (không được để trống).';
    } else if (errorNum === 12541 || errorNum === 12170 || errorMsg.includes('ORA-12541') || errorMsg.includes('NJS-')) {
      // Connection errors
      statusCode = 500;
      message = 'Lỗi kết nối cơ sở dữ liệu Oracle. Vui lòng kiểm tra lại dịch vụ database.';
    } else {
      statusCode = 500;
      message = `Lỗi cơ sở dữ liệu Oracle: ${err.message}`;
    }
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
}
