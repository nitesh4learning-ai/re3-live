"use client";
import { useParams } from 'next/navigation';
import PageRenderer from '../../PageRenderer';
export default function ProfilePage() { const { id } = useParams(); return <PageRenderer page="profile" pageId={id} />; }
