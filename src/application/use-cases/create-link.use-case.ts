import { Link } from "../../domain/entities/link.entity";
import { LinkRepository } from "../../domain/repositories/link.repository";
import { nanoid } from "nanoid";

interface CreateLinkInput {
  originalUrl: string;
  organizationId: string;
  creatorId?: string;
  customCode?: string;
}

export class CreateLinkUseCase {
  constructor(private linkRepository: LinkRepository) {}

  async execute(input: CreateLinkInput): Promise<Link> {
    const shortCode = input.customCode || nanoid(6);

    const existing = await this.linkRepository.findByCode(shortCode);
    if (existing) throw new Error("Este código corto ya existe.");

    const link = new Link({
      id: crypto.randomUUID(),
      shortCode,
      originalUrl: input.originalUrl,
      organizationId: input.organizationId,
      creatorId: input.creatorId ?? null,
      createdAt: new Date(),
      settings: {
        passQueryParams: true,
        linkCloaking: false,
        isUnsafe: false
      }
    });

    return await this.linkRepository.save(link);
  }
}