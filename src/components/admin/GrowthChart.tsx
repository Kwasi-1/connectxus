import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface GrowthChartProps {
  title: string;
  dataKey: string;
  color: string;
  fetchData: (period: string) => Promise<any[]>;
  icon?: React.ReactNode;
  formatter?: (value: number) => string;
}

export function GrowthChart({
  title,
  dataKey,
  color,
  fetchData,
  icon,
  formatter = (value) => value.toString(),
}: GrowthChartProps) {
  const [period, setPeriod] = React.useState<string>("month");
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

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["chart", title, period, currentSpaceId],
    queryFn: () => fetchData(period),
    enabled: !!currentSpaceId && currentSpaceId !== "all",
    staleTime: 30000,
  });

  const chartData = React.useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];

    return rawData.map((item) => ({
      ...item,
      date: item.date ? format(new Date(item.date), "MMM d") : "",
    }));
  }, [rawData]);

  const total = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
  }, [chartData, dataKey]);

  const average = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    return Math.round(total / chartData.length);
  }, [total, chartData]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div>
            <p className="text-2xl font-bold">{formatter(total)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-muted-foreground">
              {formatter(average)}
            </p>
            <p className="text-xs text-muted-foreground">Avg/day</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
