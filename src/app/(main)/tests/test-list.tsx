"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listTestSets } from "@/lib/api/test-sets";
import type { TestSetItem } from "@/lib/api/types";
import { SkeletonGrid } from "@/components/shared/skeleton-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { TestCard } from "./test-card";
import { SpeakingTopicCard } from "./speaking-topic-card";
import { WritingTopicCard } from "./writing-topic-card";
import { ContinueBanner } from "@/components/shared/continue-banner";
import { RecommendedBanner } from "@/components/shared/recommended-banner";

type TabType = "listening" | "reading" | "speaking" | "writing";

export function TestList() {
  const [tab, setTab] = useState<TabType>("listening");
  const [tests, setTests] = useState<TestSetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [speakingFilter, setSpeakingFilter] = useState<"tache2" | "tache3">("tache2");

  const load = useCallback(async (type: TabType) => {
    setLoading(true);
    try {
      const res = await listTestSets({ type, page_size: 100 });
      setTests(res.items);
    } catch (err) {
      console.error("Failed to load test sets", err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  // Filter by search and speaking type
  const searchLower = search.toLowerCase();
  const filteredTests = tests.filter((t) => {
    // Search filter
    if (search && !t.name.toLowerCase().includes(searchLower) && !t.code.toLowerCase().includes(searchLower)) {
      return false;
    }
    // Speaking tâche filter
    if (tab === "speaking") {
      return speakingFilter === "tache2" ? t.code.includes("tache2") : t.code.includes("tache3");
    }
    return true;
  });

  const renderCards = () => {
    if (tab === "speaking") {
      return filteredTests.map((t) => <SpeakingTopicCard key={t.id} test={t} />);
    }
    if (tab === "writing") {
      return filteredTests.map((t) => <WritingTopicCard key={t.id} test={t} />);
    }
    return filteredTests.map((t) => <TestCard key={t.id} test={t} />);
  };

  return (
    <div>
      <ContinueBanner />
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as TabType)}
    >
      <div className="mb-4">
        <Input
          placeholder="搜索题套名称或代号..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <TabsList>
        <TabsTrigger value="listening">听力</TabsTrigger>
        <TabsTrigger value="reading">阅读</TabsTrigger>
        <TabsTrigger value="speaking">口语</TabsTrigger>
        <TabsTrigger value="writing">写作</TabsTrigger>
      </TabsList>

      <TabsContent value={tab} className="mt-4">
        <RecommendedBanner type={tab} />
        {tab === "speaking" && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSpeakingFilter("tache2")}
              aria-pressed={speakingFilter === "tache2"}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                speakingFilter === "tache2"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tâche 2 · 情景对话
            </button>
            <button
              onClick={() => setSpeakingFilter("tache3")}
              aria-pressed={speakingFilter === "tache3"}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                speakingFilter === "tache3"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tâche 3 · 观点论述
            </button>
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : filteredTests.length === 0 ? (
          <EmptyState title="暂无题套" description="该分类下还没有题套" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {renderCards()}
          </div>
        )}
      </TabsContent>
    </Tabs>
    </div>
  );
}
