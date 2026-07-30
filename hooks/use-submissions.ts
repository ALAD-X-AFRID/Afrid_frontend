"use client";

import { useState, useEffect, useCallback } from "react";
import { useMetadata } from "@/context/metadata-context";
import { getMySubmissions, getAudioURL, saveTranscription } from "@/lib/api";
import type { Submission } from "@/types";

export function useSubmissions() {
  const { idToken } = useMetadata();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!idToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getMySubmissions(idToken);
      setSubmissions(data as Submission[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    load();
  }, [load]);

  const getAudio = useCallback(
    async (submissionId: string): Promise<string> => {
      if (!idToken) throw new Error("Not authenticated");
      return getAudioURL(idToken, submissionId);
    },
    [idToken]
  );

  const saveTranscript = useCallback(
    async (submissionId: string, transcriptRefined: string, translationEnglish: string) => {
      if (!idToken) throw new Error("Not authenticated");
      await saveTranscription(idToken, submissionId, transcriptRefined, translationEnglish);
      await load();
    },
    [idToken, load]
  );

  return { submissions, loading, error, reload: load, getAudio, saveTranscript };
}
