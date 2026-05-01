import { prisma } from "@/infrastructure/db/prisma-client";
import { NextResponse } from "next/server";
import { safeCatch } from "@/lib/utils/promise";

export async function GET() {
  // 1. Creamos una organización obligatoria para que el link no falle
  const [org, orgError] = await safeCatch(
    prisma.organizations.upsert({
      where: { slug: "mi-primer-saas" },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: "Mi Primer SaaS",
        slug: "mi-primer-saas",
      },
    })
  );

  if (orgError) {
    return NextResponse.json(
      { 
        error: "Failed to create organization", 
        details: orgError.message 
      },
      { status: 500 }
    );
  }

  // 2. Creamos un link de prueba
  const [link, linkError] = await safeCatch(
    prisma.links.create({
      data: {
        short_code: "google",
        original_url: "https://google.com",
        organization_id: org.id,
      },
    })
  );

  if (linkError) {
    return NextResponse.json(
      { 
        error: "Failed to create link", 
        details: linkError.message 
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    mensaje: "¡Funciona perfectamente! 🚀", 
    link_creado: link 
  });
}