"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, X, Save, Mic, Columns3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const VOICE_KEY = "momentum:voice-notes";
const PILLARS_KEY = "momentum:content-pillars";

const DEFAULT_VOICE =
  "Direct and practical. I write short, punchy lines with concrete examples over abstractions. Confident but not arrogant — I share what worked and what didn't. Occasional dry humor. No buzzwords, no hype, no emojis-as-bullets.";

const DEFAULT_PILLARS = [
  "AI in Go-To-Market",
  "Content Operations",
  "Founder-Led Content",
  "Positioning & Messaging",
];

export function SettingsForm() {
  const [voice, setVoice] = useState("");
  const [pillars, setPillars] = useState<string[]>([]);
  const [newPillar, setNewPillar] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedVoice = localStorage.getItem(VOICE_KEY);
    const savedPillars = localStorage.getItem(PILLARS_KEY);
    setVoice(savedVoice ?? DEFAULT_VOICE);
    setPillars(savedPillars ? JSON.parse(savedPillars) : DEFAULT_PILLARS);
    setLoaded(true);
  }, []);

  function saveVoice() {
    localStorage.setItem(VOICE_KEY, voice);
    toast.success("Writing voice saved", {
      description: "This will steer AI generation once it's wired up.",
    });
  }

  function addPillar() {
    const value = newPillar.trim();
    if (!value) return;
    if (pillars.length >= 5) {
      toast.error("Keep it focused — 5 pillars max.");
      return;
    }
    if (pillars.some((p) => p.toLowerCase() === value.toLowerCase())) {
      toast.error("That pillar already exists.");
      return;
    }
    const next = [...pillars, value];
    setPillars(next);
    setNewPillar("");
    localStorage.setItem(PILLARS_KEY, JSON.stringify(next));
    toast.success("Pillar added");
  }

  function removePillar(pillar: string) {
    const next = pillars.filter((p) => p !== pillar);
    setPillars(next);
    localStorage.setItem(PILLARS_KEY, JSON.stringify(next));
  }

  if (!loaded) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Voice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Writing voice
          </CardTitle>
          <CardDescription>
            Describe your tone in your own words. This will be passed to the AI
            model to keep drafts sounding like you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voice">Your tone &amp; style</Label>
            <Textarea
              id="voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              rows={8}
              placeholder="e.g. Direct, practical, short sentences, concrete examples…"
            />
          </div>
          <Button onClick={saveVoice} className="gap-1.5">
            <Save className="h-4 w-4" />
            Save voice
          </Button>
        </CardContent>
      </Card>

      {/* Pillars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Columns3 className="h-5 w-5 text-primary" />
            Content pillars
          </CardTitle>
          <CardDescription>
            Define 3–5 recurring themes you want to keep coming back to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {pillars.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No pillars yet — add your first below.
              </p>
            )}
            {pillars.map((pillar) => (
              <span
                key={pillar}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
              >
                {pillar}
                <button
                  onClick={() => removePillar(pillar)}
                  className="text-accent-foreground/60 transition-colors hover:text-destructive"
                  aria-label={`Remove ${pillar}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newPillar}
              onChange={(e) => setNewPillar(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPillar();
                }
              }}
              placeholder="Add a content pillar…"
              disabled={pillars.length >= 5}
            />
            <Button
              onClick={addPillar}
              variant="outline"
              className="gap-1.5"
              disabled={pillars.length >= 5}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {pillars.length}/5 pillars
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
