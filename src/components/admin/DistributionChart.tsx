import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart2, PieChart as PieChartIcon } from "lucide-react";

interface DistributionChartProps {
  title: string;
  dataKey: string;
  labelKey: string;
  color: string;
  fetchData: () => Promise<any[]>;
  icon?: React.ReactNode;
}

const COLORS = [
  "#3b82f6", 
  "#10b981", 
  "#f59e0b", 
  "#8b5cf6", 
  "#ef4444", 
  "#06b6d4", 
  "#6366f1", 
  "#ec4899", 
  "#14b8a6", 
  "#f97316", 
];

export function DistributionChart({
  title,
  dataKey,
  labelKey,
  color,
  fetchData,
  icon,
}: DistributionChartProps) {
  const [chartType, setChartType] = React.useState<"bar" | "pie">("bar");
  const [currentSpaceId, setCurrentSpaceId] = React.useState<string>(() => {
    return localStorage.getItem("admin-current-space-id") || "";
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const newSpaceId = localStorage.getItem("admin-current-space-id") || "";
      setCurrentSpaceId(newSpaceId);
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["distribution-chart", title, currentSpaceId],
    queryFn: fetchData,
    enabled: !!currentSpaceId && currentSpaceId !== "all",
    staleTime: 30000,
  });

  const total = React.useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, item) => acc + (item[dataKey] || 0), 0);
  }, [data, dataKey]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              {icon}
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            Error loading data
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="h-8 w-8 p-0"
            >
              <BarChart2 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("pie")}
              className="h-8 w-8 p-0"
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{total.toLocaleString()}</span>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            {chartType === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey={labelKey}
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey={dataKey}
                    nameKey={labelKey}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry[labelKey]}: ${entry[dataKey]}`}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
