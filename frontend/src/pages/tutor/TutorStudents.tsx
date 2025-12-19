import { Skeleton } from '@/components/ui/skeleton';

export function TutorStudents() {
  const students: any[] = [];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Học sinh của tôi</h1>

      {students.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Student cards will be rendered here */}
        </div>
      )}
    </div>
  );
}

export default TutorStudents;
