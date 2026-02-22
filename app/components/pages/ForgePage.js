"use client";
import { useParams } from 'next/navigation';
import PageRenderer from '../../PageRenderer';
export default function ForgePage() { const { sessionId } = useParams() || {}; return <PageRenderer page="forge" pageId={sessionId} />; }
