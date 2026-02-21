import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-2 bg-gray-200/60" />
                    <Skeleton className="h-4 w-96 bg-gray-200/60" />
                </div>
                <Skeleton className="h-10 w-32 bg-gray-200/60" />
            </div>

            {/* KPI Cards / Main content Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-24 bg-gray-200/60" />
                            <Skeleton className="h-4 w-4 rounded-full bg-gray-200/60" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2 bg-gray-200/60" />
                            <Skeleton className="h-3 w-32 bg-gray-200/60" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Data Table Skeleton */}
            <Card className="border-gray-200 mt-6">
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2 bg-gray-200/60" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4 mb-6">
                            <Skeleton className="h-10 w-64 bg-gray-200/60" />
                            <Skeleton className="h-10 w-32 bg-gray-200/60" />
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full bg-gray-200/60" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
