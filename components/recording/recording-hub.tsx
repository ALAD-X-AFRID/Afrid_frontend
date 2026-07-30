"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMetadata } from "@/context/metadata-context";
import { getTasks, uploadSubmission } from "@/lib/api";
import Recorder from "@/components/recording/recorder";
import AnimatedSection from "@/components/ui/animated-section";
import Link from "next/link";

const durations = [15, 20, 30];
const modes = ["read_speech", "spontaneous"];

const contextCategories = [
  {
    label: "Culture & Tradition",
    icon: "🌍",
    tags: ["Folklore", "Traditions", "Ceremonies", "Proverbs", "Oral History", "Storytelling"],
  },
  {
    label: "Daily Life",
    icon: "🏠",
    tags: ["Cooking", "Family", "Greetings", "Home", "Neighborhood", "Chores"],
  },
  {
    label: "Market & Business",
    icon: "💼",
    tags: ["Market", "Negotiation", "Trade", "Haggling", "Business", "Shopping"],
  },
  {
    label: "Public & Social",
    icon: "🚌",
    tags: ["Public Transport", "Gatherings", "Events", "Street", "Cafe", "Social"],
  },
  {
    label: "Education",
    icon: "📚",
    tags: ["Classroom", "Lecture", "Reading", "Study", "Tutorial"],
  },
  {
    label: "Religious & Spiritual",
    icon: "🕌",
    tags: ["Prayer", "Sermon", "Chant", "Worship", "Reflection"],
  },
  {
    label: "Music & Arts",
    icon: "🎵",
    tags: ["Songs", "Lyrics", "Poetry", "Rap", "Chants", "Instrumental"],
  },
  {
    label: "Quiet / Controlled",
    icon: "🔇",
    tags: ["Quiet", "Studio", "Indoor", "Noise-Free"],
  },
];

const contextPrompts: Record<string, { read: string; spontaneous: string }> = {
  Folklore: { read: "An elder tells the story of the tortoise and the hare, switching between the local language and English for emphasis.", spontaneous: "Recount a folktale you heard growing up. Mix languages naturally as you tell it." },
  Traditions: { read: "The chief explains the significance of the new yam festival, alternating between Igbo and English.", spontaneous: "Describe a traditional ceremony you attended recently. Switch languages as you naturally would." },
  Ceremonies: { read: "A wedding MC addresses the crowd in Yoruba, Pidgin, and English as different families arrive.", spontaneous: "Describe a ceremony you attended — a wedding, naming, or festival. Mix languages naturally." },
  Proverbs: { read: "An elder shares proverbs about patience, explaining each in both the local language and English.", spontaneous: "Share three proverbs you know and explain their meanings. Switch languages as you speak." },
  "Oral History": { read: "A grandparent recounts the history of their village, weaving between the mother tongue and English.", spontaneous: "Tell a story about your community's history that was passed down to you. Mix languages naturally." },
  Storytelling: { read: "A narrator tells a cautionary tale about greed, using the local language for dialogue and English for narration.", spontaneous: "Tell a short story about a clever character in your culture. Switch languages as you narrate." },
  Cooking: { read: "A mother teaches her daughter to cook jollof rice, giving instructions in Yoruba and English.", spontaneous: "Describe how to cook your favorite local dish. Mix languages naturally as you explain." },
  Family: { read: "A family gathers for dinner. The parents speak Yoruba while the children respond in English and Pidgin.", spontaneous: "Describe a typical family gathering at your home. Switch languages as you naturally would." },
  Greetings: { read: "A young man greets his elders at a gathering, using formal Yoruba greetings and English pleasantries.", spontaneous: "Demonstrate how you greet different people in your community — elders, peers, children. Mix languages." },
  Home: { read: "A family discusses weekend plans at home, switching between English and their mother tongue.", spontaneous: "Describe a typical morning at your house. Switch languages as you naturally would." },
  Neighborhood: { read: "Neighbors chat over the fence about a recent event, mixing Pidgin, English, and the local language.", spontaneous: "Describe your neighborhood and a recent interesting event. Mix languages naturally." },
  Chores: { read: "A parent gives instructions to children about household chores, alternating between English and Igbo.", spontaneous: "Describe your daily chores and routines. Switch languages as you naturally would." },
  Market: { read: "The market opens before dawn. Traders call out prices in Yoruba and Pidgin, switching between both as customers arrive.", spontaneous: "Describe your journey to the market this morning. Mix languages naturally." },
  Negotiation: { read: "A buyer and seller negotiate the price of fabric, switching between Hausa and English to build rapport.", spontaneous: "Describe a recent negotiation you had — at a shop, market, or with a colleague. Mix languages." },
  Trade: { read: "A trader explains the quality of goods to a customer, alternating between the local language and English.", spontaneous: "Describe a trading experience you've had. Switch languages as you naturally would." },
  Haggling: { read: "A customer haggles for a bag of rice while her children ask for sweets in Igbo.", spontaneous: "Reenact a haggling scene at a market. Mix languages naturally." },
  Business: { read: "A shop owner discusses supply orders with a distributor, switching between English and the local language.", spontaneous: "Describe a business interaction you had recently. Switch languages as you naturally would." },
  Shopping: { read: "A customer asks about products in a store, mixing English with the local language for specific items.", spontaneous: "Describe a recent shopping trip. Switch languages as you naturally would." },
  "Public Transport": { read: "Passengers discuss the day's news on a bus, switching between Pidgin, English, and Yoruba.", spontaneous: "Describe a recent journey on public transport. Mix languages naturally." },
  Gatherings: { read: "Friends at a gathering share news and jokes, switching between English, Pidgin, and their mother tongue.", spontaneous: "Describe a recent social gathering you attended. Switch languages naturally." },
  Events: { read: "An MC at a community event addresses the crowd in multiple languages to include everyone.", spontaneous: "Describe a recent event you attended — a concert, match, or festival. Mix languages." },
  Street: { read: "Street vendors call out their wares, mixing Pidgin, English, and the local language to attract customers.", spontaneous: "Describe the sounds and scenes of a busy street you know. Switch languages naturally." },
  Cafe: { read: "Friends at a cafe debate football, switching between English and their mother tongue.", spontaneous: "Describe a conversation you had at a cafe or restaurant. Mix languages naturally." },
  Social: { read: "Friends catch up after a long time, mixing English, Pidgin, and their local language.", spontaneous: "Describe a recent social interaction with friends. Switch languages naturally." },
  Classroom: { read: "A teacher explains a science concept, switching between English and the local language for clarity.", spontaneous: "Describe a memorable classroom experience. Mix languages as you naturally would." },
  Lecture: { read: "A guest lecturer explains history, alternating between English and the local language for cultural context.", spontaneous: "Describe a lecture or talk you attended. Switch languages naturally." },
  Reading: { read: "A student reads aloud from a textbook, then summarizes the passage in their mother tongue.", spontaneous: "Read a short passage and then summarize it in your local language. Mix naturally." },
  Study: { read: "Two students quiz each other before an exam, mixing English with their local language.", spontaneous: "Describe how you study with friends. Switch languages as you naturally would." },
  Tutorial: { read: "A tutor explains a math problem, switching between English and the local language for key terms.", spontaneous: "Explain a concept you know well as if teaching someone. Mix languages naturally." },
  Prayer: { read: "A leader recites a prayer, alternating between Arabic, the local language, and English for the congregation.", spontaneous: "Describe a prayer experience that was meaningful to you. Mix languages naturally." },
  Sermon: { read: "A preacher delivers a sermon, switching between the local language and English for emphasis.", spontaneous: "Describe a sermon or speech you heard recently. Switch languages naturally." },
  Chant: { read: "A group chants a traditional song, with the leader calling and the group responding in the local language.", spontaneous: "Recite a chant or call-and-response you know. Mix languages naturally." },
  Worship: { read: "Worshippers sing hymns, alternating between English and the local language for different verses.", spontaneous: "Describe a worship experience you had. Switch languages naturally." },
  Reflection: { read: "A person reflects on their faith journey, mixing English with their mother tongue for personal expressions.", spontaneous: "Reflect on a spiritual or personal experience. Mix languages naturally." },
  Songs: { read: "A singer performs a traditional song, with verses in the local language and a chorus in English.", spontaneous: "Sing or describe a song from your culture. Mix languages naturally." },
  Lyrics: { read: "A songwriter explains the meaning behind their lyrics, switching between English and the local language.", spontaneous: "Describe the meaning of a song you love. Switch languages naturally." },
  Poetry: { read: "A poet recites a poem about home, alternating between the local language and English.", spontaneous: "Recite or compose a short poem about your culture. Mix languages naturally." },
  Rap: { read: "A rapper freestyles, switching between Pidgin, English, and the local language for different bars.", spontaneous: "Freestyle or describe a rap you enjoy. Mix languages naturally." },
  Chants: { read: "A group chants at a sporting event, mixing English and the local language for different chants.", spontaneous: "Describe or perform a chant from a sporting or cultural event. Mix languages." },
  Instrumental: { read: "A musician describes the instruments they play, switching between English and the local language for names.", spontaneous: "Describe the music and instruments from your culture. Mix languages naturally." },
  Quiet: { read: "A person reads a passage aloud in a quiet room, with clear pronunciation in the local language.", spontaneous: "Describe your surroundings in a quiet setting. Speak clearly in your local language." },
  Studio: { read: "A voice actor records a script, alternating between English and the local language for different lines.", spontaneous: "Describe your day as if recording a voice diary. Mix languages naturally." },
  Indoor: { read: "A family has a quiet conversation indoors, switching between English and their mother tongue.", spontaneous: "Describe a quiet indoor scene or conversation. Mix languages naturally." },
  "Noise-Free": { read: "A narrator reads a passage with no background noise, using the local language with clear diction.", spontaneous: "Talk about your day in a noise-free environment. Mix languages naturally." },
};

export default function RecordingHub() {
  const { user, idToken, metadata } = useMetadata();
  const router = useRouter();
  const [tasks, setTasks] = useState<{ id?: string; title?: string; type?: string }[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [duration, setDuration] = useState(15);
  const [mode, setMode] = useState("spontaneous");
  const [contextTag, setContextTag] = useState("Market");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [codeSwitching, setCodeSwitching] = useState(true);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [submissionId, setSubmissionId] = useState("");

  const [tasksError, setTasksError] = useState("");

  useEffect(() => {
    getTasks()
      .then((data) => {
        const speechTasks = data.filter((t: { type?: string }) => t.type === "speech");
        setTasks(speechTasks.length ? speechTasks : data);
        if (speechTasks.length) setSelectedTask(speechTasks[0].id || "");
      })
      .catch((err) => {
        setTasksError((err as Error).message);
      });
  }, []);

  const contextPrompt = contextPrompts[contextTag] || contextPrompts["Market"];
  const prompt = mode === "read_speech" ? contextPrompt.read : contextPrompt.spontaneous;

  const handleRecorded = (wav: Blob, seconds: number) => {
    setBlob(wav);
    setRecordedSeconds(seconds);
  };

  const handleUpload = async () => {
    if (!blob || !idToken) return;
    setUploading(true);
    setUploadError("");
    setUploadResult("");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");
      formData.append("task_id", selectedTask);
      formData.append("duration", String(recordedSeconds));
      formData.append("target_duration", String(duration * 60));
      formData.append("mode", mode);
      formData.append("context_tag", contextTag);
      formData.append("code_switching", String(codeSwitching));
      const result = await uploadSubmission(idToken, formData);
      setUploadResult(`Uploaded · ${result.provenance_id}`);
      setSubmissionId(result.submission_id);
      if (result.submission_id) {
        setTimeout(() => router.push(`/transcribe/${result.submission_id}`), 3000);
      }
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <AnimatedSection>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Recording Hub
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          One-Press Record
        </h1>
        <p className="mt-4 text-muted">
          Pick a block, read or speak naturally, and capture the audio that global
          AI currently misses.
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                Duration block
              </p>
              <div className="flex gap-3">
                {durations.map((min) => (
                  <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                      duration === min
                        ? "border-border-strong bg-gradient-primary text-white"
                        : "border-border text-white hover:border-border-strong"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                Mode
              </p>
              <div className="flex gap-3">
                {modes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-full border px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                      mode === m
                        ? "border-border-strong bg-gradient-primary text-white"
                        : "border-border text-white hover:border-border-strong"
                    }`}
                  >
                    {m.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                Context
              </p>
              <div className="space-y-2">
                {contextCategories.map((cat) => (
                  <div key={cat.label}>
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === cat.label ? null : cat.label)}
                      className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-white transition-colors hover:border-border-strong"
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="flex-1 text-left font-medium">{cat.label}</span>
                      <span className="text-xs text-muted">
                        {cat.tags.some((t) => t === contextTag) && (
                          <span className="mr-2 rounded-full bg-gradient-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                            {contextTag}
                          </span>
                        )}
                        {expandedCategory === cat.label ? "−" : "+"}
                      </span>
                    </button>
                    {expandedCategory === cat.label && (
                      <div className="mt-2 flex flex-wrap gap-2 pl-2">
                        {cat.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setContextTag(tag);
                              setExpandedCategory(null);
                            }}
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                              contextTag === tag
                                ? "border-border-strong bg-gradient-primary text-white"
                                : "border-border text-white/80 hover:border-border-strong hover:text-white"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <p className="text-sm font-semibold text-white">Code-switching</p>
                <p className="text-xs text-muted">Mix languages naturally in the same sentence.</p>
              </div>
              <button
                type="button"
                onClick={() => setCodeSwitching(!codeSwitching)}
                className={`relative h-6 w-12 rounded-full transition-colors ${
                  codeSwitching ? "bg-gradient-primary" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-surface transition-all ${
                    codeSwitching ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                Sprint
              </p>
              {tasksError ? (
                <p className="text-xs text-[#ff6b6b]">Failed to load tasks: {tasksError}</p>
              ) : (
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white outline-none transition-colors focus:border-border-strong"
                >
                  {tasks.map((t) => (
                    <option key={t.id || "none"} value={t.id || ""} className="bg-surface">
                      {t.title || "Open sprint"}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Prompt
                </p>
                <span className="rounded-full bg-gradient-primary/10 border border-[#39e0ff]/20 px-3 py-0.5 text-[10px] font-semibold text-[#39e0ff]">
                  {contextTag}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white">{prompt}</p>
            </div>

            <Recorder duration={duration * 60} onRecorded={handleRecorded} />
          </div>
        </div>
      </AnimatedSection>

      {blob && (
        <AnimatedSection className="mt-10 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-white">
            Recording ready: {recordedSeconds}s WAV
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleUpload}
              disabled={uploading || !user}
              className="rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Submit recording"}
            </button>
            <button
              onClick={() => setBlob(null)}
              className="text-sm text-muted hover:text-white"
            >
              Discard
            </button>
          </div>
          {uploadResult && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-white">{uploadResult}</p>
              <p className="text-xs text-muted">Redirecting to transcription page in 3 seconds...</p>
              {submissionId && (
                <button
                  onClick={() => router.push(`/transcribe/${submissionId}`)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-card-hover"
                >
                  Transcribe & translate now →
                </button>
              )}
            </div>
          )}
          {uploadError && <p className="mt-4 text-sm text-red-400">{uploadError}</p>}
        </AnimatedSection>
      )}

      {!user && (
        <p className="mt-8 text-center text-sm text-muted">
          Please{" "}
          <Link href="/" className="text-white underline">
            sign in
          </Link>{" "}
          to submit recordings.
        </p>
      )}
    </div>
  );
}
