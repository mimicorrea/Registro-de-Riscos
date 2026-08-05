import type {
  OccurrenceCategory,
  OccurrenceSeverity,
  OccurrenceStatus,
  RoleName,
} from '@/lib/enums';

export type DbUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: RoleName;
  createdAt: Date;
  updatedAt: Date;
};

export type DbAttachment = {
  id: string;
  occurrenceId: string;
  url: string;
  label: string | null;
  createdAt: Date;
};

export type DbComment = {
  id: string;
  occurrenceId: string;
  authorId: string;
  content: string;
  createdAt: Date;
};

export type DbStatusHistory = {
  id: string;
  occurrenceId: string;
  previous: OccurrenceStatus;
  current: OccurrenceStatus;
  note: string | null;
  createdById: string;
  createdAt: Date;
};

export type DbOccurrence = {
  id: string;
  title: string;
  description: string;
  category: OccurrenceCategory;
  severity: OccurrenceSeverity;
  status: OccurrenceStatus;
  reporterId: string | null;
  isAnonymous: boolean;
  anonContact: string | null;
  assigneeId: string | null;
  locationId: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
};

export type OccurrenceWithRelations = DbOccurrence & {
  reporter: DbUser | null;
  assignee: DbUser | null;
  location: { id: string; name: string } | null;
  attachments: DbAttachment[];
  comments: (DbComment & { author: DbUser })[];
  statusHistory: (DbStatusHistory & { createdBy: DbUser })[];
};
