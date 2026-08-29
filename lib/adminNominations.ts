import "server-only";
import { createClient } from "@supabase/supabase-js";

export type NominationRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  submission_reference: string;
  status: string;
  category: string;
  nomination_type: string;
  nominee_name: string;
  nominee_organisation: string;
  nominee_email: string;
  nominator_name: string;
  nominator_email: string;
  entry_title: string;
  payload: Record<string, unknown>;
  internal_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function getAdminNominationClient() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
