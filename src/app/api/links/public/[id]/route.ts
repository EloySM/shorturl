import { prisma } from "@/infrastructure/db/prisma-client";
import { NextResponse } from "next/server";
import { safeCatch } from "@/lib/utils/promise";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  
  const [deleted, error] = await safeCatch(
    prisma.links.delete({
      where: { id: (await params).id }
    })
  )

  if (error) return NextResponse.json({ error: 'No se pudo borrar' }, { status: 500 })
  
  return NextResponse.json({ message: 'Link eliminado'})
}