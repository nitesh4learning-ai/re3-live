"use client";
import { useParams } from 'next/navigation';
import PageRenderer from '../../PageRenderer';
export default function ArticleRoute() { const { id } = useParams(); return <PageRenderer page="article" pageId={id} />; }
