"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, Clock, Mic, Loader2, BookOpen, Check, RefreshCw, Edit3 } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

interface Internship {
  id: string;
  companyName: string;
  role: string;
}

interface DiaryEntry {
  id: string;
  internshipId: string;
  roughNotes: string;
  content: string;
  mood: string;
  hoursWorked: number;
  skills: string[];
  isDraft: boolean;
  entryDate: string;
}

export default function DiaryPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [selectedInternshipId, setSelectedInternshipId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [roughNotes, setRoughNotes] = useState("");
  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(0);
  const [mood, setMood] = useState("productive");
  
  // AI Polish Result
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isEditingAiText, setIsEditingAiText] = useState(false);
  const [editedText, setEditedText] = useState("");

  const formatHoursMinutes = (totalHrs: number) => {
    if (!totalHrs) return "0h 0m";
    const h = Math.floor(totalHrs);
    const m = Math.round((totalHrs - h) * 60);
    return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
  };

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      try {
        const res = await fetchApi("/internships");
        if (res.ok) {
          const data: Internship[] = await res.json();
          setInternships(data);
          if (data.length > 0) {
            setSelectedInternshipId(data[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load page data", e);
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, []);

  useEffect(() => {
    const loadRecentEntries = async () => {
      if (!selectedInternshipId) return;
      try {
        const res = await fetchApi(`/diary?internshipId=${selectedInternshipId}`);
        if (res.ok) {
          const data = await res.json();
          setRecentEntries(data);
        }
      } catch (e) {
        console.error("Failed to load recent entries", e);
      }
    };
    loadRecentEntries();
  }, [selectedInternshipId, currentEntry]);

  const handleSaveDraft = async () => {
    if (!selectedInternshipId) {
      alert("Please add an internship first.");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        internshipId: selectedInternshipId,
        roughNotes,
        mood,
        hoursWorked: Number(hours) + Number(minutes) / 60,
        isDraft: true,
        entryDate: new Date(date).toISOString(),
        content: editedText || currentEntry?.content || ""
      };

      let res;
      if (currentEntry?.id) {
        res = await fetchApi(`/diary/${currentEntry.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchApi("/diary", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const saved: DiaryEntry = await res.json();
        setCurrentEntry(saved);
        setEditedText(saved.content);
        alert("Draft saved successfully!");
      }
    } catch (e) {
      console.error("Failed to save draft", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDirectly = async () => {
    if (!selectedInternshipId) {
      alert("Please add an internship first.");
      return;
    }
    if (!roughNotes.trim()) {
      alert("Please write your entry content first.");
      return;
    }

    setIsSaving(true);
    try {
      const activeInternship = internships.find(i => i.id === selectedInternshipId);
      
      // Auto-detect skills based on their own keywords
      const skillsRes = await fetchApi(`/diary/detect-skills-preview`, {
        method: "POST",
        body: JSON.stringify({
          text: roughNotes,
          role: activeInternship?.role
        })
      }).catch(() => null);

      let skills: string[] = [];
      if (skillsRes && skillsRes.ok) {
        skills = await skillsRes.json();
      }
      if (skills.length === 0) {
        skills = ["Professionalism"];
      }

      const payload = {
        internshipId: selectedInternshipId,
        roughNotes,
        mood,
        hoursWorked: Number(hours) + Number(minutes) / 60,
        isDraft: false,
        entryDate: new Date(date).toISOString(),
        content: roughNotes, // Save exactly what they typed
        skills
      };

      const res = await fetchApi("/diary", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Diary entry saved directly successfully!");
        setRoughNotes("");
        setEditedText("");
        setCurrentEntry(null);
      } else {
        alert("Failed to save entry. Please try again.");
      }
    } catch (e) {
      console.error("Failed to save entry directly", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiPolish = async () => {
    if (!selectedInternshipId) {
      alert("Please add an internship first.");
      return;
    }
    if (!roughNotes.trim()) {
      alert("Please add some rough notes first to polish.");
      return;
    }

    setIsPolishing(true);
    try {
      const activeInternship = internships.find(i => i.id === selectedInternshipId);
      
      const res = await fetchApi("/ai/enhance-diary", {
        method: "POST",
        body: JSON.stringify({
          text: roughNotes,
          role: activeInternship?.role,
          company: activeInternship?.companyName
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Also fetch dynamic skills based on the current context
        const skillsRes = await fetchApi(`/diary/detect-skills-preview`, {
          method: "POST",
          body: JSON.stringify({
            text: data.generatedText,
            role: activeInternship?.role
          })
        }).catch(() => null);

        let skills: string[] = [];
        if (skillsRes && skillsRes.ok) {
          skills = await skillsRes.json();
        }

        // Setup the local entry draft object
        setCurrentEntry({
          id: currentEntry?.id || "",
          internshipId: selectedInternshipId,
          roughNotes,
          content: data.generatedText,
          mood,
          hoursWorked: Number(hours) + Number(minutes) / 60,
          skills: skills.length > 0 ? skills : ["Professionalism"],
          isDraft: true,
          entryDate: new Date(date).toISOString()
        });

        setEditedText(data.generatedText);
        setIsEditingAiText(false);
      } else {
        alert("AI Polishing failed. Please try again.");
      }
    } catch (e) {
      console.error("Error polishing diary entry", e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleAcceptEntry = async () => {
    setIsFinalizing(true);
    try {
      const payload = {
        internshipId: selectedInternshipId,
        roughNotes,
        mood,
        hoursWorked: Number(hours) + Number(minutes) / 60,
        isDraft: false,
        entryDate: new Date(date).toISOString(),
        content: editedText,
        skills: currentEntry?.skills || []
      };

      let res;
      if (currentEntry?.id) {
        res = await fetchApi(`/diary/${currentEntry.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchApi("/diary", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert("Diary entry finalized and saved!");
        setRoughNotes("");
        setEditedText("");
        setCurrentEntry(null);
        setIsEditingAiText(false);
      }
    } catch (e) {
      console.error("Failed to finalize entry", e);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Diary</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Log your daily activities and let AI write professional entries.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : internships.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
          <BookOpen className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No active internships</h3>
          <p className="text-sm text-zinc-500 text-center mt-1">Please add an internship first before creating daily diary entries.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT PANEL: User Keywords */}
          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle>Draft Entry</CardTitle>
                <CardDescription>Jot down your rough notes or keywords for the day.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="internship">Choose Internship</Label>
                  <select 
                    id="internship" 
                    value={selectedInternshipId} 
                    onChange={(e) => setSelectedInternshipId(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {internships.map((internship) => (
                      <option key={internship.id} value={internship.id}>
                        {internship.role} at {internship.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notes">Rough Notes / Keywords</Label>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-500">
                      <Mic className="h-4 w-4 mr-1" />
                      Voice
                    </Button>
                  </div>
                  <Textarea 
                    id="notes" 
                    placeholder="e.g.,&#10;fixed login issue&#10;updated dashboard&#10;checked SIEM alerts" 
                    className="min-h-[150px] resize-none"
                    value={roughNotes}
                    onChange={(e) => setRoughNotes(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time Worked</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center border border-input rounded-md px-2 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Input type="number" min="0" max="24" id="hours" className="border-0 focus-visible:ring-0 px-1 text-center" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
                        <span className="text-xs text-zinc-500 font-medium select-none pr-1">h</span>
                      </div>
                      <div className="flex items-center border border-input rounded-md px-2 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Input type="number" min="0" max="59" id="minutes" className="border-0 focus-visible:ring-0 px-1 text-center" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
                        <span className="text-xs text-zinc-500 font-medium select-none pr-1">m</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood</Label>
                    <select 
                      id="mood" 
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="productive">🔥 Productive</option>
                      <option value="normal">😊 Normal</option>
                      <option value="tired">🥱 Tired</option>
                      <option value="stressed">😫 Stressed</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </div>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/50 pt-4 mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isPolishing}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Draft
                </Button>
                <Button variant="secondary" onClick={handleSaveDirectly} disabled={isSaving || isPolishing}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Directly
                </Button>
              </div>
              <Button 
                onClick={handleAiPolish} 
                disabled={isPolishing || isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 w-full sm:w-auto"
              >
                {isPolishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Professional Entry
              </Button>
            </CardFooter>
          </Card>

          {/* RIGHT PANEL: AI Generated & Accept/Edit/Regenerate Controls */}
          <div className="space-y-6 flex flex-col justify-between h-full">
            <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-900/50 backdrop-blur-sm border-indigo-100 dark:border-indigo-900/30 flex-grow flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-400">
                      <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                      AI Generated Result
                    </CardTitle>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">Preview</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentEntry?.content ? (
                    <div className="space-y-3">
                      {isEditingAiText ? (
                        <div className="space-y-1">
                          <Label htmlFor="ai-editor" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Edit Entry</Label>
                          <Textarea
                            id="ai-editor"
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="min-h-[140px] bg-white dark:bg-zinc-950 border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-white/70 dark:bg-zinc-950/70 border border-indigo-100 dark:border-indigo-900/30 rounded-lg shadow-sm">
                          <p className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed font-normal">
                            {editedText || currentEntry.content}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {currentEntry.skills && currentEntry.skills.map((skill, index) => (
                          <div key={index} className="px-2.5 py-0.5 bg-indigo-100/60 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-full text-xs font-semibold">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Sparkles className="h-8 w-8 text-indigo-300 dark:text-indigo-700 mb-3 animate-bounce" />
                      <p className="italic text-zinc-500 text-sm max-w-sm">
                        Type keywords on the left and click "Generate Professional Entry" to transform them into formal logs.
                      </p>
                    </div>
                  )}
                </CardContent>
              </div>

              {currentEntry?.content && (
                <CardFooter className="flex flex-col gap-3 border-t border-indigo-100/40 dark:border-indigo-900/20 pt-4 mt-4">
                  <div className="flex items-center gap-2 w-full justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditingAiText(!isEditingAiText);
                        if (!isEditingAiText) setEditedText(currentEntry.content);
                      }}
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400"
                    >
                      <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                      {isEditingAiText ? "Done Editing" : "Edit"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAiPolish}
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400"
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Regenerate
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleAcceptEntry} 
                      disabled={isFinalizing}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-50 dark:hover:bg-indigo-600"
                    >
                      {isFinalizing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                      Accept & Save
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>

            <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries.length === 0 ? (
                    <p className="text-xs text-zinc-500">No entries yet for this internship.</p>
                  ) : (
                    recentEntries.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {new Date(entry.entryDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center text-xs text-zinc-500 font-medium bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                            <Clock className="mr-1 w-3 h-3"/> {formatHoursMinutes(entry.hoursWorked || 0)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {entry.content || entry.roughNotes}
                        </p>
                        {entry.skills && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.skills.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
