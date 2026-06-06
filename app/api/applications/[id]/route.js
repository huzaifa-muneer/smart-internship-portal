import { NextResponse } from 'next/server';import { getDb } from '@/lib/db';import { requireUser } from '@/lib/auth';
export const dynamic='force-dynamic';
export async function PATCH(req,{params}){try{await requireUser(req,['admin']);const b=await req.json();(await getDb()).prepare('UPDATE applications SET status=? WHERE id=?').run(b.status,params.id);return NextResponse.json({ok:true})}catch(e){return NextResponse.json({error:e.message},{status:403})}}
