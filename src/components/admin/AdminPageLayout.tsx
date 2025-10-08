import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download } from "lucide-react";

interface StatCard {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
}

interface ActionButton {
  label: string;
  icon?: ReactNode;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg";
  onClick?: () => void;
}

interface FilterOption {
  value: string;
  label: string;
}

interface TabConfig {
  value: string;
  label: string;
  content: ReactNode;
}

interface AdminPageLayoutProps {
  // Header
  title: string;
  actionButtons?: ActionButton[];

  // Statistics Cards
  statsCards?: StatCard[];

  // Content Card
  contentTitle?: string;

  // Search and Filters
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  showFilter?: boolean;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;

  // Tabs
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (value: string) => void;

  // Main Content (when not using tabs)
  children?: ReactNode;

  // Loading state
  isLoading?: boolean;
  loadingCardCount?: number;
}

export function AdminPageLayout({
  title,
  actionButtons = [],
  statsCards = [],
  contentTitle,
  showSearch = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  showFilter = false,
  filterValue = "",
  onFilterChange,
  filterOptions = [],
  filterPlaceholder = "Filter",
  tabs,
  activeTab,
  onTabChange,
  children,
  isLoading = false,
  loadingCardCount = 4,
}: AdminPageLayoutProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">{title}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(loadingCardCount)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">{title}</h1>
        {actionButtons.length > 0 && (
          <div className="flex items-center space-x-2">
            {actionButtons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || "outline"}
                size={button.size || "sm"}
                onClick={button.onClick}
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content */}
      <Card>
        {(contentTitle || showSearch || showFilter || tabs) && (
          <CardHeader>
            <div className="flex items-center justify-between">
              {contentTitle && <CardTitle>{contentTitle}</CardTitle>}
              {(showSearch || showFilter) && (
                <div className="flex items-center space-x-2">
                  {showSearch && (
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}
                  {showFilter && (
                    <Select value={filterValue} onValueChange={onFilterChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={filterPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent>
          {tabs ? (
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-4">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  );
}
