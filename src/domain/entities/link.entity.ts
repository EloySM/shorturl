export interface LinkProps {
  id: string;
  shortCode: string;
  originalUrl: string;
  organizationId: string;
  creatorId?: string | null;
  expiresAt?: Date | null;
  settings: {
    passQueryParams: boolean;
    linkCloaking: boolean;
    isUnsafe: boolean;
  };
  createdAt: Date;
}

export class Link {
  constructor(private readonly props: LinkProps) {}

  get id() { return this.props.id; }
  get shortCode() { return this.props.shortCode; }
  get originalUrl() { return this.props.originalUrl; }
  get organizationId() { return this.props.organizationId; }
  get settings() { return this.props.settings; }
  get expiresAt() { return this.props.expiresAt; }
  get creatorId() { return this.props.creatorId; }
  get createdAt() { return this.props.createdAt; }

  public toPersistence() {
    return {
      id: this.props.id,
      shortCode: this.props.shortCode,
      originalUrl: this.props.originalUrl,
      organizationId: this.props.organizationId,
      creatorId: this.props.creatorId,
      expiresAt: this.props.expiresAt,
      passQueryParams: this.props.settings.passQueryParams,
      linkCloaking: this.props.settings.linkCloaking,
      isUnsafe: this.props.settings.isUnsafe,
    };
  }
}