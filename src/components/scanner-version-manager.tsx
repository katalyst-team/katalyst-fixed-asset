"use client";

import {
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { type ScannerAppVersion } from "@/constants/app-version";

interface UpdateCheckResult {
  hasUpdate: boolean;
  isForceUpdate: boolean;
  currentVersion: ScannerAppVersion;
  userVersion?: {
    version: string;
    versionCode: number;
  };
  message: {
    en: string;
    id: string;
  };
}

export function ScannerVersionManager() {
  const [currentVersion, setCurrentVersion] =
    useState<ScannerAppVersion | null>(null);
  const [testVersion, setTestVersion] = useState("");
  const [testResult, setTestResult] = useState<UpdateCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current version on component mount
  useEffect(() => {
    fetchCurrentVersion();
  }, []);

  const fetchCurrentVersion = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/scanner/version-management");
      if (!response.ok) throw new Error("Failed to fetch version");

      const version = await response.json();
      setCurrentVersion(version);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testUpdateCheck = async () => {
    if (!testVersion.trim()) {
      setError("Please enter a version to test");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/scanner/check-update?version=${encodeURIComponent(testVersion)}`
      );

      if (!response.ok) throw new Error("Failed to check update");

      const result = await response.json();
      setTestResult(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setTestResult(null);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scanner App Version Manager</h1>
          <p className="text-muted-foreground">
            Kelola dan monitor versi aplikasi scanner
          </p>
        </div>
        <Button disabled={loading} onClick={fetchCurrentVersion}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Version Info */}
      {currentVersion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Current Scanner App Version</span>
            </CardTitle>
            <CardDescription>
              Informasi versi terbaru aplikasi scanner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Version</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">{currentVersion.version}</Badge>
                  <span className="text-sm text-muted-foreground">
                    (Code: {currentVersion.versionCode})
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Release Date</Label>
                <p className="text-sm">
                  {formatDate(currentVersion.releaseDate)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">File Size</Label>
                <p className="text-sm">
                  {formatFileSize(currentVersion.fileSizeBytes)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Min Required</Label>
                <p className="text-sm">{currentVersion.minRequiredVersion}</p>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Download URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  readOnly
                  className="font-mono text-xs"
                  value={currentVersion.downloadUrl}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(currentVersion.downloadUrl, "_blank")
                  }
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  Release Notes (EN)
                </Label>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  {currentVersion.releaseNotes.en.map((note, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Release Notes (ID)
                </Label>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  {currentVersion.releaseNotes.id.map((note, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Check Tester */}
      <Card>
        <CardHeader>
          <CardTitle>Test Update Check</CardTitle>
          <CardDescription>
            Test mekanisme update check dengan versi tertentu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="test-version">Test Version</Label>
              <Input
                id="test-version"
                placeholder="e.g., 0.9.5"
                value={testVersion}
                onChange={(e) => setTestVersion(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button disabled={loading} onClick={testUpdateCheck}>
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Test Check
              </Button>
            </div>
          </div>

          {testResult && (
            <Card
              className={`${
                testResult.isForceUpdate
                  ? "border-destructive"
                  : testResult.hasUpdate
                    ? "border-warning"
                    : "border-green-500"
              }`}
            >
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {testResult.isForceUpdate ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : testResult.hasUpdate ? (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <span className="font-medium">
                        {testResult.isForceUpdate
                          ? "Force Update Required"
                          : testResult.hasUpdate
                            ? "Update Available"
                            : "Up to Date"}
                      </span>
                    </div>
                    <Badge
                      variant={
                        testResult.isForceUpdate
                          ? "destructive"
                          : testResult.hasUpdate
                            ? "default"
                            : "secondary"
                      }
                    >
                      {testResult.userVersion?.version} →{" "}
                      {testResult.currentVersion.version}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Message (EN):</strong>
                      <p className="text-muted-foreground">
                        {testResult.message.en}
                      </p>
                    </div>
                    <div>
                      <strong>Message (ID):</strong>
                      <p className="text-muted-foreground">
                        {testResult.message.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
