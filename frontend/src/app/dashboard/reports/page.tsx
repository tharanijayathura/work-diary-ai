import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Download, FileText, Calendar, Filter } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Generate and download your internship reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate New Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for a New Report Card */}
        <Card className="bg-zinc-100/50 dark:bg-zinc-800/20 border-dashed border-2 border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center p-6 text-center min-h-[250px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Create Report</h3>
          <p className="text-sm text-zinc-500 max-w-[200px]">
            Compile your diary entries into a weekly, monthly or final report.
          </p>
        </Card>

        {/* Generated Reports */}
        {[
          { type: 'Monthly Report', date: 'April 2026', format: 'PDF', status: 'Ready' },
          { type: 'Weekly Report', date: 'Week 12 (Mar 23 - Mar 29)', format: 'DOCX', status: 'Ready' },
          { type: 'Weekly Report', date: 'Week 11 (Mar 16 - Mar 22)', format: 'PDF', status: 'Ready' },
        ].map((report, index) => (
          <Card key={index} className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{report.type}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {report.date}
                  </CardDescription>
                </div>
                <div className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs rounded-md font-medium">
                  {report.format}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Contains summarized tasks, skills developed, and challenges overcome during this period.
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
              <Button variant="ghost" className="w-full justify-center">
                <Download className="mr-2 h-4 w-4" />
                Download {report.format}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
