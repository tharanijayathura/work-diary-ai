import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, BookOpen, TrendingUp } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Welcome back! Here&apos;s what&apos;s happening with your internships.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128.5</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">+12.5 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diary Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Current streak: 5 days</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Frontend Dev, UI/UX Design</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest diary entries and reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Implemented authentication flow</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Frontend Dev Internship • Today, 10:00 AM</p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-primary">
                    AI Rewritten
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle>Top Skills Detected</CardTitle>
            <CardDescription>Skills identified from your diary entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['React', 'TypeScript', 'API Integration', 'UI Design'].map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">{skill}</span>
                  </div>
                  <span className="text-sm text-zinc-500">{(5 - index) * 3} mentions</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
