import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles, BookOpen, Brain, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "WorkDiary AI - The Intelligent Internship Companion",
  description: "Automate your daily internship logs with AI. WorkDiary AI helps you track, summarize, and reflect on your daily tasks effortlessly.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-gradient-to-b from-primary/20 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">WorkDiary AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>Your AI-Powered Internship Log</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl mb-6">
          Write Less. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Achieve More.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Say goodbye to tedious daily logs. Let WorkDiary AI track your tasks, summarize your achievements, and generate professional reports automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="rounded-full h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
              Start for free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg bg-background/50 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50">
              View Demo
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          {[
            {
              icon: Brain,
              title: "AI Summarization",
              description: "Jot down rough notes and let our AI transform them into professional daily logs.",
            },
            {
              icon: Clock,
              title: "Time Tracking",
              description: "Easily track hours spent on different projects and tasks throughout your internship.",
            },
            {
              icon: CheckCircle2,
              title: "Automated Reports",
              description: "Generate weekly or monthly progress reports with a single click.",
            },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{feature.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 mt-auto border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-300">WorkDiary AI</span>
          </div>
          <p>© {new Date().getFullYear()} WorkDiary AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
