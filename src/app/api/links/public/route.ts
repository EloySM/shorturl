import { prisma } from "@/infrastructure/db/prisma-client"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { safeCatch } from "@/lib/utils/promise"

export async function POST(req: Request) {
  // 1. Leemos el JSON una sola vez
  const [body, bodyError] = await safeCatch(req.json())

  // 2. Validamos que el body exista y traiga la propiedad 'url'
  if (bodyError || !body?.url) {
    return NextResponse.json(
      { error: "The url is required" },
      { status: 400 }
    )
  }

  // 3. Obtenemos o creamos la organización pública
  const [publicOrg, publicOrgError] = await safeCatch(
    prisma.organizations.upsert({
      where: { slug: "public" },
      update: {},
      create: {
        name: "Public Links",
        slug: "public",
      },
    })
  )

  if (publicOrgError || !publicOrg) {
    return NextResponse.json(
      { error: "DB error (organizations)", details: publicOrgError?.message },
      { status: 500 }
    )
  }

  // 4. Creamos el link usando los datos del body
  const [link, linkError] = await safeCatch(
    prisma.links.create({
      data: {
        short_code: nanoid(6),
        original_url: body.url, // Usamos body.url directamente
        organization_id: publicOrg.id
      }
    })
  )

  if (linkError || !link) {
    return NextResponse.json(
      { error: "DB Error (links)", details: linkError?.message },
      { status: 500 }
    )
  }

  // 5. Respuesta exitosa
  return NextResponse.json({
    message: "🚀 Link creado!",
    shortUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${link.short_code}`,
    data: link
  })
}