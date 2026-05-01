import { Link } from "../entities/link.entity";

export interface LinkRepository {
  save(link: Link): Promise<Link>;
  findByCode(code: string): Promise<Link | null>;
  delete(id: string): Promise<void>;
}