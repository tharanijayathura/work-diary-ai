"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Building, Calendar, Loader2, Edit3, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

interface Internship {
  id: string;
  companyName: string;
  role: string;
  status: string;
  startDate: string;
  endDate?: string | null;
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Dialog state
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadInternships = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi("/internships");
      if (res.ok) {
        const data = await res.json();
        setInternships(data);
      }
    } catch (e) {
      console.error("Failed to load internships", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetchApi("/internships", {
        method: "POST",
        body: JSON.stringify({
          companyName: newCompany,
          role: newRole,
          startDate: new Date(newStartDate).toISOString(),
          skills: []
        }),
      });
      
      if (res.ok) {
        setIsAddDialogOpen(false);
        setNewCompany("");
        setNewRole("");
        loadInternships();
      }
    } catch (e) {
      console.error("Failed to add internship", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (e: React.MouseEvent, internship: Internship) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingInternship(internship);
    setEditCompany(internship.companyName);
    setEditRole(internship.role);
    setEditStatus(internship.status || "ACTIVE");
  };

  const handleUpdateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInternship) return;
    setIsUpdating(true);

    try {
      const res = await fetchApi(`/internships/${editingInternship.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          companyName: editCompany,
          role: editRole,
          status: editStatus,
        }),
      });

      if (res.ok) {
        setEditingInternship(null);
        loadInternships();
      } else {
        alert("Failed to update internship. Please try again.");
      }
    } catch (err) {
      console.error("Failed to update internship", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteInternship = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this internship and all its daily logs?")) return;

    try {
      const res = await fetchApi(`/internships/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInternships(prev => prev.filter(i => i.id !== id));
      } else {
        alert("Failed to delete internship.");
      }
    } catch (err) {
      console.error("Failed to delete internship", err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internships</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage your internship and project experiences.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Internship
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Internship</DialogTitle>
              <DialogDescription>
                Enter the details of your new internship or project.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddInternship}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">Company</Label>
                  <Input id="company" className="col-span-3" required value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g., Google" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <Input id="role" className="col-span-3" required value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g., Software Engineer Intern" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">Start Date</Label>
                  <Input id="startDate" type="date" className="col-span-3" required value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Internship
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingInternship} onOpenChange={(open) => !open && setEditingInternship(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Internship Details</DialogTitle>
              <DialogDescription>
                Modify your role, company name, or current status.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateInternship}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-company" className="text-right">Company</Label>
                  <Input id="edit-company" className="col-span-3" required value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">Role</Label>
                  <Input id="edit-role" className="col-span-3" required value={editRole} onChange={(e) => setEditRole(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">Status</Label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : internships.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
          <Building className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No internships yet</h3>
          <p className="text-sm text-zinc-500 text-center mt-1">Add your first internship to start tracking your daily progress.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {internships.map((internship) => (
            <Link key={internship.id} href={`/dashboard/internships/${internship.id}`} className="block focus:outline-none">
              <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-md transition-all hover:-translate-y-1 h-full cursor-pointer flex flex-col justify-between">
                <div>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{internship.role}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {internship.companyName}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-1 z-10" onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100" onClick={(e) => startEdit(e, internship)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" onClick={(e) => handleDeleteInternship(e, internship.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm mt-4">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(internship.startDate)} - {internship.endDate ? formatDate(internship.endDate) : 'Present'}
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full font-medium ${internship.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {internship.status === 'ACTIVE' ? 'Active' : 'Completed'}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
