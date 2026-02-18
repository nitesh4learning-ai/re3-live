"use client";
import { useParams } from 'next/navigation';
import PageRenderer from '../../PageRenderer';
export default function PostRoute() { const { id } = useParams(); return <PageRenderer page="post" pageId={id} />; }
