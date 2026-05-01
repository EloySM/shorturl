import { LinkRepository } from "../../domain/repositories/link.repository";
import { Link } from "../../domain/entities/link.entity";
import { prisma } from "../db/prisma-client";

export class PrismaLinkRepository implements LinkRepository {
  
  async save(link: Link): Promise<Link> {
    const data = link.toPersistence();
    
    await prisma.link.upsert({
      where: { id: data.id },
      update: {
        shortCode: data.shortCode,
        originalUrl: data.originalUrl,
        expiresAt: data.expiresAt,
        passQueryParams: data.passQueryParams,
        linkCloaking: data.linkCloaking,
        isUnsafe: data.isUnsafe,
      },
      create: {
        id: data.id,
        shortCode: data.shortCode,
        originalUrl: data.originalUrl,
        organizationId: data.organizationId,
        creatorId: data.creatorId,
        expiresAt: data.expiresAt,
        passQueryParams: data.passQueryParams,
        linkCloaking: data.linkCloaking,
        isUnsafe: data.isUnsafe,
      }
    });
    
    return link;
  }

  async findByCode(code: string): Promise<Link | null> {
    const record = await prisma.link.findUnique({
      where: { shortCode: code }
    });
    
    if (!record) return null;

    return new Link({
      id: record.id,
      shortCode: record.shortCode,
      originalUrl: record.originalUrl,
      organizationId: record.organizationId,
      creatorId: record.creatorId,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      settings: {
        passQueryParams: record.passQueryParams,
        linkCloaking: record.linkCloaking,
        isUnsafe: record.isUnsafe
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.link.delete({ where: { id } });
  }
}