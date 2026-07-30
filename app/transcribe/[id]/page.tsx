import TranscriptionEditor from "@/components/recording/transcription-editor";

export default function TranscribePage({ params }: { params: { id: string } }) {
  return (
    <section className="px-6 pb-24 pt-32">
      <TranscriptionEditor submissionId={params.id} />
    </section>
  );
}
