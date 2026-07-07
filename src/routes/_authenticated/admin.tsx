import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { lessonsQuery, vocabularyQuery, LEVELS, type Lesson, type Level } from "@/lib/data";

const CATEGORIES = ["vocabulary", "grammar", "listening", "speaking", "reading", "quiz"] as const;

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, refresh } = useAuth();
  const [claiming, setClaiming] = useState(false);

  const claim = async () => {
    setClaiming(true);
    try {
      const { data, error } = await (
        supabase.rpc as unknown as (fn: string) => Promise<{ data: boolean | null; error: unknown }>
      )("claim_admin");
      if (error) throw error;
      if (data) {
        toast.success("You're now an admin!");
        await refresh();
      } else {
        toast.error("An admin already exists. Ask them to grant you access.");
      }
    } catch {
      toast.error("Couldn't claim admin access.");
    } finally {
      setClaiming(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Admin access required</h1>
          <p className="mt-2 text-muted-foreground">
            If you're the site owner and no admin exists yet, claim admin access below.
          </p>
          <Button variant="hero" className="mt-6" onClick={claim} disabled={claiming}>
            Claim admin access
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">Admin panel</h1>
        <p className="mt-1 text-muted-foreground">Manage lessons and vocabulary.</p>
        <Tabs defaultValue="lessons" className="mt-6">
          <TabsList>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          </TabsList>
          <TabsContent value="lessons"><LessonsAdmin /></TabsContent>
          <TabsContent value="vocabulary"><VocabAdmin /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const emptyLesson = {
  title: "",
  description: "",
  level: "beginner" as Level,
  category: "vocabulary" as (typeof CATEGORIES)[number],
  xp_reward: 20,
  order_index: 0,
  published: true,
  intro: "",
  quizJson: "[]",
};

function LessonsAdmin() {
  const qc = useQueryClient();
  const { data: lessons = [] } = useQuery(lessonsQuery());
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLesson);

  const openNew = () => { setForm(emptyLesson); setEditId(null); setOpen(true); };
  const openEdit = (l: Lesson) => {
    setForm({
      title: l.title,
      description: l.description ?? "",
      level: l.level,
      category: l.category,
      xp_reward: l.xp_reward,
      order_index: l.order_index,
      published: l.published,
      intro: l.content.intro ?? "",
      quizJson: JSON.stringify(l.content.quiz ?? [], null, 2),
    });
    setEditId(l.id);
    setOpen(true);
  };

  const save = async () => {
    let quiz: unknown = [];
    try { quiz = JSON.parse(form.quizJson || "[]"); } catch { toast.error("Quiz JSON is invalid."); return; }
    const payload = {
      title: form.title,
      description: form.description,
      level: form.level,
      category: form.category,
      xp_reward: Number(form.xp_reward),
      order_index: Number(form.order_index),
      published: form.published,
      content: { intro: form.intro, quiz } as never,
    };
    const res = editId
      ? await supabase.from("lessons").update(payload).eq("id", editId)
      : await supabase.from("lessons").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editId ? "Lesson updated" : "Lesson created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["lessons"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Lesson deleted");
    qc.invalidateQueries({ queryKey: ["lessons"] });
  };

  return (
    <div className="mt-4">
      <div className="flex justify-end">
        <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> New lesson</Button>
      </div>
      <div className="mt-4 space-y-2">
        {lessons.map((l) => (
          <Card key={l.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{l.title} {!l.published && <span className="text-xs text-muted-foreground">(draft)</span>}</p>
              <p className="text-xs text-muted-foreground">{l.level} · {l.category} · +{l.xp_reward} XP</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit lesson" : "New lesson"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as Level })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as (typeof CATEGORIES)[number] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>XP reward</Label><Input type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: Number(e.target.value) })} /></div>
              <div><Label>Order</Label><Input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Intro text</Label><Textarea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} /></div>
            <div>
              <Label>Quiz JSON (array of {"{question, options[], answer}"})</Label>
              <Textarea rows={6} className="font-mono text-xs" value={form.quizJson} onChange={(e) => setForm({ ...form, quizJson: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <Label>Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save} disabled={!form.title}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VocabAdmin() {
  const qc = useQueryClient();
  const { data: vocab = [] } = useQuery(vocabularyQuery());
  const [form, setForm] = useState({ word: "", translation: "", example: "", phonetic: "", level: "beginner" as Level });

  const add = async () => {
    const { error } = await supabase.from("vocabulary").insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success("Word added");
    setForm({ word: "", translation: "", example: "", phonetic: "", level: "beginner" });
    qc.invalidateQueries({ queryKey: ["vocabulary"] });
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("vocabulary").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["vocabulary"] });
  };

  return (
    <div className="mt-4">
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Word (English)</Label><Input value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} /></div>
          <div><Label>Translation (Indonesian)</Label><Input value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} /></div>
          <div><Label>Example</Label><Input value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} /></div>
          <div><Label>Phonetic</Label><Input value={form.phonetic} onChange={(e) => setForm({ ...form, phonetic: e.target.value })} /></div>
          <div>
            <Label>Level</Label>
            <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as Level })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="hero" className="mt-3" onClick={add} disabled={!form.word || !form.translation}>
          <Plus className="h-4 w-4" /> Add word
        </Button>
      </Card>
      <div className="mt-4 space-y-2">
        {vocab.map((v) => (
          <Card key={v.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{v.word} → {v.translation}</p>
              <p className="text-xs text-muted-foreground">{v.level}{v.example ? ` · ${v.example}` : ""}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
