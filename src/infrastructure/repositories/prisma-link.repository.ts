import { LinkRepository } from "../../domain/repositories/link.repository";
import { Link } from "../../domain/entities/link.entity";
import { prisma } from "../db/prisma-client";
import { safeCatch } from "@/lib/utils/promise";

export class PrismaLinkRepository implements LinkRepository {
  
  async save(link: Link): Promise<Link> {
    const data = link.toPersistence();
    
    await prisma.links.upsert({
      where: { id: data.id },
      update: {
        short_code: data.shortCode,
        original_url: data.originalUrl,
        expires_at: data.expiresAt,
        pass_query_params: data.passQueryParams,
        link_cloaking: data.linkCloaking,
        is_unsafe: data.isUnsafe,
      },
      create: {
        id: data.id,
        short_code: data.shortCode,
        original_url: data.originalUrl,
        organization_id: data.organizationId,
        creator_id: data.creatorId,
        expires_at: data.expiresAt,
        pass_query_params: data.passQueryParams,
        link_cloaking: data.linkCloaking,
        is_unsafe: data.isUnsafe,
      }
    });
    
    return link;
  }

  async findByCode(code: string): Promise<Link | null> {
    const record = await prisma.links.findUnique({
      where: { short_code: code }
    });
    
    if (!record) return null;

    return new Link({
      id: record.id,
      shortCode: record.short_code,
      originalUrl: record.original_url,
      organizationId: record.organization_id ?? '',
      creatorId: record.creator_id,
      expiresAt: record.expires_at,
      createdAt: record.created_at ?? new Date(),
      settings: {
        passQueryParams: record.pass_query_params ?? false,
        linkCloaking: record.link_cloaking ?? false,
        isUnsafe: record.is_unsafe ?? false
      }
    });
  }

  async delete(id: string): Promise<void> {
    await safeCatch(
      prisma.links.delete({ where: { id } })
    )
  }
}