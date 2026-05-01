import { prisma } from "@/infrastructure/db/prisma-client"
import { NextResponse } from "next/server"
import { safeCatch } from "@/lib/utils/promise"

export async function GET() {
  const [links, error] = await safeCatch(
    prisma.links.findMany({   // findMany busca varios, trae una lista(array) de todos los registros que cumplan con la condicion
      where: {
        organizations: { slug: "public" } // Solo links públicos
      },
      include: {
        _count: {
          select: { clicks: true } // Esto cuenta las filas de la tabla clicks
        }
      },
      orderBy: { created_at: 'desc' }   // Esto es para que los links mas nuevos aparezcan en la parte de arriva de la tabla
    })
  )

  if (error) return NextResponse.json({ error: "Error cargando links" }, { status: 500 })

  return NextResponse.json(links)   // Enviamos un array de objetos al frontend
}