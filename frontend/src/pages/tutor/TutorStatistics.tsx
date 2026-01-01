export function TutorStatistics() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Thống kê</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Stats cards placeholder */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-muted-foreground text-sm">Thống kê {i + 1}</p>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-muted-foreground">Biểu đồ sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
}

export default TutorStatistics;
