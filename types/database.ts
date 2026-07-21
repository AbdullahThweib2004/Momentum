// Momentum — database model types
// These mirror the SQL schema in supabase/migrations/0001_initial_schema.sql

export type InterestSource = "manual" | "derived_from_publish";

export type InteractionType = "like" | "comment" | "share" | "other";

export type DraftStatus = "draft" | "approved" | "rejected" | "published";

export type Platform = "linkedin" | "x";

export interface Interest {
  id: string;
  user_id: string;
  topic: string;
  description: string | null;
  weight: number;
  source: InterestSource;
  created_at: string;
}

export interface EngagementLog {
  id: string;
  user_id: string;
  post_url: string | null;
  post_summary: string;
  interaction_type: InteractionType;
  related_interest_id: string | null;
  created_at: string;
}

export interface PostDraft {
  id: string;
  user_id: string;
  content: string;
  topic_tag: string;
  platform: Platform;
  related_interest_id: string | null;
  status: DraftStatus;
  scheduled_for: string | null;
  published_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface DailyTopic {
  id: string;
  user_id: string;
  topic: string;
  active: boolean;
  created_at: string;
}

export interface DailyBatch {
  id: string;
  user_id: string;
  batch_date: string; // YYYY-MM-DD
  created_at: string;
}

// Convenience shapes returned by the data layer (with joined relations)
export interface EngagementLogWithInterest extends EngagementLog {
  interest?: Pick<Interest, "id" | "topic"> | null;
}

export interface PostDraftWithInterest extends PostDraft {
  interest?: Pick<Interest, "id" | "topic"> | null;
}

// Supabase generated-style Database type (subset we use).
export interface Database {
  public: {
    Tables: {
      interests: {
        Row: Interest;
        Insert: Omit<Interest, "id" | "created_at" | "user_id"> &
          Partial<Pick<Interest, "id" | "created_at" | "user_id">>;
        Update: Partial<Interest>;
      };
      engagement_logs: {
        Row: EngagementLog;
        Insert: Omit<EngagementLog, "id" | "created_at" | "user_id"> &
          Partial<Pick<EngagementLog, "id" | "created_at" | "user_id">>;
        Update: Partial<EngagementLog>;
      };
      post_drafts: {
        Row: PostDraft;
        Insert: Omit<PostDraft, "id" | "created_at" | "user_id"> &
          Partial<Pick<PostDraft, "id" | "created_at" | "user_id">>;
        Update: Partial<PostDraft>;
      };
      daily_topics: {
        Row: DailyTopic;
        Insert: Omit<DailyTopic, "id" | "created_at" | "user_id"> &
          Partial<Pick<DailyTopic, "id" | "created_at" | "user_id">>;
        Update: Partial<DailyTopic>;
      };
      daily_batches: {
        Row: DailyBatch;
        Insert: Omit<DailyBatch, "id" | "created_at" | "user_id"> &
          Partial<Pick<DailyBatch, "id" | "created_at" | "user_id">>;
        Update: Partial<DailyBatch>;
      };
    };
  };
}
