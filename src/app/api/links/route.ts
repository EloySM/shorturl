import { NextResponse } from "next/server";
import { PrismaLinkRepository } from "@/infrastructure/repositories/prisma-link.repository";
import { CreateLinkUseCase } from "@/application/use-cases/create-link.use-case";
import { safeCatch } from "@/lib/utils/promise";

export async function POST(req: Request) {
  // 1. Parse request body
  const [body, parseError] = await safeCatch(req.json());
  
  if (parseError) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // 2. Validate required fields
  if (!body.originalUrl || !body.organizationId) {
    return NextResponse.json(
      { error: "Missing required fields: originalUrl, organizationId" },
      { status: 400 }
    );
  }

  // 3. Execute use case
  const repository = new PrismaLinkRepository();
  const useCase = new CreateLinkUseCase(repository);

  const [link, linkError] = await safeCatch(
    useCase.execute({
      originalUrl: body.originalUrl,
      organizationId: body.organizationId,
      creatorId: body.userId,
      customCode: body.customCode,
    })
  );

  if (linkError) {
    return NextResponse.json(
      { error: linkError.message },
      { status: 400 }
    );
  }

  return NextResponse.json(link.toPersistence(), { status: 201 });
}