import { NextResponse } from 'next/server';import { getDb } from '@/lib/db';import { requireUser } from '@/lib/auth';
export const dynamic='force-dynamic';
export async function GET(req){try{await requireUser(req,['admin']);const rows=(await getDb()).prepare("SELECT id,email,name,company_name,hr_name,website,linkedin,contact,status,created_at FROM users WHERE role='company' ORDER BY id DESC").all();return NextResponse.json({companies:rows})}catch(e){return NextResponse.json({error:e.message},{status:403})}}
