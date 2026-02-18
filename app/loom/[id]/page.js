"use client";
import { useParams } from 'next/navigation';
import PageRenderer from '../../PageRenderer';
export default function LoomCycleRoute() { const { id } = useParams(); return <PageRenderer page="loom-cycle" pageId={id} />; }
