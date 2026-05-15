"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Building, Calendar, Clock, Loader2, Target, BookOpen, PlusCircle } from "lucide-react";

interface Internship {
  id: string;
  companyName: string;
  role: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  skills: string[];
}

interface DiaryEntry {
  id: string;
  roughNotes: string;
  content: string;
  hoursWorked: number;
  mood: string;
  skills: string[];
  entryDate: string;
}

export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [internship, setInternship] = useState<Internship | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInternshipAndEntries = async () => {
      try {
        const [intRes, entRes] = await Promise.all([
          fetchApi(`/internships/${id}`),
          fetchApi(`/diary?internshipId=${id}`),
        ]);

        if (intRes.ok) {
          const intData = await intRes.json();
          setInternship(intData);
        } else {
          router.push("/dashboard/internships");
          return;
        }

        if (entRes.ok) {
          const entData = await entRes.json();
          setEntries(entData.filter((e: any) => !e.isDraft));
        }
      } catch (e) {
        console.error("Failed to fetch internship details", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadInternshipAndEntries();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!internship) {
    return null;
  }

  // Calculate actual stats
  const totalHoursFloat = entries.reduce((acc, e) => acc + (e.hoursWorked || 0), 0);
  const formatHoursMinutes = (totalHrs: number) => {
    if (!totalHrs) return "0h 0m";
    const h = Math.floor(totalHrs);
    const m = Math.round((totalHrs - h) * 60);
    return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
  };

  const getMoodEmoji = (moodStr: string) => {
    switch (moodStr) {
      case "productive": return "🔥 Productive";
      case "normal": return "😊 Normal";
      case "tired": return "🥱 Tired";
      case "stressed": return "😫 Stressed";
      default: return "💼 Professional";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/internships")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{internship.role}</h1>
            <p className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mt-1">
              <Building className="h-4 w-4" />
              {internship.companyName}
            </p>
          </div>
        </div>

        <Button onClick={() => router.push(`/dashboard/diary`)} className="self-start md:self-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Log Daily Diary
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Target className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internship.status === "ACTIVE" ? "Active" : "Completed"}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Start Date</CardTitle>
            <Calendar className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(internship.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHoursMinutes(totalHoursFloat)}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">Realtime calculation</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diary Entries</CardTitle>
            <Target className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">Realtime calculation</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Diary Entries</CardTitle>
                <CardDescription>Activity logs explicitly mapped to this role.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/logs')}>
                View All History
              </Button>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2" />
                  <p className="text-sm text-zinc-500">No logs added for this internship yet.</p>
                  <Button variant="link" size="sm" onClick={() => router.push('/dashboard/diary')}>
                    Log your first entry now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {new Date(entry.entryDate).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-zinc-100 dark:bg-zinc-800 font-medium px-2 py-0.5 rounded flex items-center text-zinc-600 dark:text-zinc-300">
                            <Clock className="w-3 h-3 mr-1" /> {formatHoursMinutes(entry.hoursWorked || 0)}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                            {getMoodEmoji(entry.mood)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/50 p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800/80">
                        {entry.content || entry.roughNotes}
                      </p>

                      {entry.skills && entry.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.skills.map((skill, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
            <CardHeader>
              <CardTitle className="text-lg">Skills Gained</CardTitle>
              <CardDescription>Aggregate tags from your logs.</CardDescription>
            </CardHeader>
            <CardContent>
              {internship.skills && internship.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {internship.skills.map((skill, index) => (
                    <div key={index} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {skill}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-xs leading-relaxed">No skills recorded yet. Add daily diary entries to automatically populate professional tags!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
