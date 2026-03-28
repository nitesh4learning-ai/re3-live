// /academy/plus/[programId] — Individual program view
import { getProgram, getAllProgramIds } from "../lib/program-loader";
import ProgramShell from "./ProgramShell";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllProgramIds().map(id => ({ programId: id }));
}

export async function generateMetadata({ params }) {
  const { programId } = await params;
  const program = getProgram(programId);
  if (!program) return { title: "Program Not Found" };
  return {
    title: { absolute: `${program.title} — Re³ Academy Plus` },
    description: program.description,
  };
}

export default async function ProgramPage({ params }) {
  const { programId } = await params;
  const program = getProgram(programId);
  if (!program) notFound();
  return <ProgramShell programId={programId} program={program} />;
}
