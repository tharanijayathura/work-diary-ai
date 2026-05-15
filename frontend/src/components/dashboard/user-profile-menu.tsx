"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuGroup,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

function getApiBaseUrl() {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
  return apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
}

export function UserProfileMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [hasWalletProvider, setHasWalletProvider] = useState(false);
  const [walletMessage, setWalletMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("workdiary-current-user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const w = window as any;
      const provider = w.ethereum || (w.web3 && w.web3.currentProvider);
      setHasWalletProvider(!!provider);
    } catch (e) {
      setHasWalletProvider(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("workdiary-current-user");
    router.push("/login");
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/profile/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || undefined,
          email: email || undefined,
          password: password || undefined,
        }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }
      
      setUser(data.user);
      localStorage.setItem("workdiary-current-user", JSON.stringify(data.user));
      setMessage({ text: "Profile updated successfully", type: "success" });
      setPassword(""); // Clear password field after successful update
      
      // Close dialog after short delay
      setTimeout(() => {
        setIsEditOpen(false);
        setMessage(null);
      }, 1500);
      
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Failed to update profile", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  if (!user) {
    return <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="relative h-8 w-8 rounded-full hover:opacity-85 focus:outline-none transition-opacity">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || ""} alt={user.name || "User"} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          {hasWalletProvider && (
            <DropdownMenuItem
              onClick={async () => {
                setWalletMessage(null);
                try {
                  const w = window as any;
                  const provider = w.ethereum || (w.web3 && w.web3.currentProvider);
                  if (!provider || !provider.request) throw new Error("No wallet provider available");
                  await provider.request({ method: "eth_requestAccounts" });
                  setWalletMessage("Wallet connected");
                } catch (err) {
                  setWalletMessage(err instanceof Error ? err.message : String(err));
                }
              }}
              className="cursor-pointer"
            >
              <span>Connect Wallet</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProfile}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
            </div>
            {message && (
              <p className={`text-sm mb-4 ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
                {message.text}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
          {walletMessage && <p className="text-sm mt-3 text-zinc-500">{walletMessage}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
