"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function InitAdmin() {
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [department, setDepartment] = useState("Administration");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin user");
      }

      setResult(
        `Admin user created successfully! You can now log in with:\nEmail: ${email}\nPassword: ${password}`
      );

      toast({
        title: "Success",
        description: "Admin user created successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create admin user";
      setResult(`Error: ${errorMessage}`);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Initialize Admin User</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateAdmin}
            className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}>
              {isLoading ? "Creating Admin..." : "Create Admin User"}
            </Button>

            {result && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  result.startsWith("Error")
                    ? "bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                    : "bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                }`}>
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
