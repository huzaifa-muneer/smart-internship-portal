import { NextResponse } from 'next/server';import { requireUser,safeUser } from '@/lib/auth';
export const dynamic='force-dynamic';
export async function GET(req){try{return NextResponse.json({user:safeUser(await requireUser(req))})}catch(e){return NextResponse.json({error:e.message},{status:401})}}
