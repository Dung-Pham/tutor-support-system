export function TutorSettings() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Cài đặt</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-2">Thông tin cá nhân</h2>
          <p className="text-muted-foreground text-sm">Quản lý thông tin hồ sơ của bạn</p>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-2">Bảo mật</h2>
          <p className="text-muted-foreground text-sm">Quản lý mật khẩu và bảo mật tài khoản</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Thông báo</h2>
          <p className="text-muted-foreground text-sm">Cấu hình cài đặt thông báo</p>
        </div>
      </div>
    </div>
  );
}

export default TutorSettings;
