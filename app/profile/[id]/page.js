"use client";
import { useParams } from 'next/navigation';
import PageRenderer from '../../PageRenderer';
export default function ProfileRoute() { const { id } = useParams(); return <PageRenderer page="profile" pageId={id} />; }
