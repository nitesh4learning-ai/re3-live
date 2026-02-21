"use client";
import { useParams } from 'next/navigation';
import PageRenderer from '../../PageRenderer';
export default function ArenaPage() { const { runId } = useParams(); return <PageRenderer page="arena" pageId={runId} />; }
