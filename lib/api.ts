/**
 * GraphQL operations targeting konfig-facade.
 * All REST fetch calls have been replaced with Apollo Client operations.
 */
import { gql } from "@apollo/client";
import { apolloClient } from "./apollo";

// ─── Shared fragments ──────────────────────────────────────────────────────

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    authId
    firstName
    lastName
    fullName
    scopes
  }
`;

const SETTING_FIELDS = gql`
  fragment SettingFields on Setting {
    id
    key
    settingType
    value
    description
    isActive
    createdAt
    updatedAt
    createdBy
    updatedBy
    createdByUser { ...UserFields }
    updatedByUser { ...UserFields }
  }
  ${USER_FIELDS}
`;

const AUDIT_FIELDS = gql`
  fragment AuditFields on AuditEntry {
    id
    settingKey
    action
    previousValue
    newValue
    changedBy
    changedByUser { ...UserFields }
    changedAt
  }
  ${USER_FIELDS}
`;

// ─── TypeScript shapes ─────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  authId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  scopes: string[];
}

export interface ApiSetting {
  id: string;
  key: string;
  settingType: string;
  value: unknown;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdByUser: ApiUser | null;
  updatedByUser: ApiUser | null;
}

export interface SettingsPage {
  data: ApiSetting[];
  total: number;
}

export interface AuditEntry {
  id: string;
  settingKey: string;
  action: string;
  previousValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedByUser: ApiUser | null;
  changedAt: string;
}

export interface AuditPage {
  data: AuditEntry[];
  total: number;
  page: number;
  perPage: number;
}

export interface BulkResult {
  action: string;
  matched: number;
  affected: number;
}

// ─── GraphQL documents ─────────────────────────────────────────────────────

export const SYNC_PROFILE = gql`
  mutation SyncProfile {
    syncProfile { ...UserFields }
  }
  ${USER_FIELDS}
`;

const LIST_SETTINGS = gql`
  query ListSettings($type: SettingType, $active: Boolean, $page: Int, $per_page: Int) {
    settings(type: $type, active: $active, page: $page, per_page: $per_page) {
      total
      data { ...SettingFields }
    }
  }
  ${SETTING_FIELDS}
`;

const GET_SETTING = gql`
  query GetSetting($key: String!) {
    setting(key: $key) { ...SettingFields }
  }
  ${SETTING_FIELDS}
`;

const SETTING_HISTORY = gql`
  query SettingHistory($key: String!, $page: Int, $per_page: Int) {
    settingHistory(key: $key, page: $page, per_page: $per_page) {
      ...AuditFields
    }
  }
  ${AUDIT_FIELDS}
`;

const AUDIT_LOG = gql`
  query AuditLog(
    $setting_key: String
    $action: String
    $changed_by: String
    $from: String
    $to: String
    $page: Int
    $per_page: Int
  ) {
    auditLog(
      setting_key: $setting_key
      action: $action
      changed_by: $changed_by
      from: $from
      to: $to
      page: $page
      per_page: $per_page
    ) {
      total
      page
      perPage
      data { ...AuditFields }
    }
  }
  ${AUDIT_FIELDS}
`;

const CREATE_SETTING = gql`
  mutation CreateSetting($input: CreateSettingInput!) {
    createSetting(input: $input) { ...SettingFields }
  }
  ${SETTING_FIELDS}
`;

const UPDATE_SETTING = gql`
  mutation UpdateSetting($key: String!, $input: UpdateSettingInput!) {
    updateSetting(key: $key, input: $input) { ...SettingFields }
  }
  ${SETTING_FIELDS}
`;

const DELETE_SETTING = gql`
  mutation DeleteSetting($key: String!) {
    deleteSetting(key: $key)
  }
`;

const BULK_ACTION = gql`
  mutation BulkAction($filter: BulkFilterInput!, $action: BulkActionType!) {
    bulkAction(filter: $filter, action: $action) {
      action
      matched
      affected
    }
  }
`;

// ─── API functions ─────────────────────────────────────────────────────────

export async function listSettings(params?: {
  type?: string;
  active?: boolean;
  page?: number;
  per_page?: number;
}): Promise<SettingsPage> {
  const { data } = await apolloClient.query({
    query: LIST_SETTINGS,
    variables: {
      type: params?.type,
      active: params?.active,
      page: params?.page,
      per_page: params?.per_page,
    },
  });
  return data.settings;
}

export async function getSetting(key: string): Promise<ApiSetting | null> {
  const { data } = await apolloClient.query({
    query: GET_SETTING,
    variables: { key },
  });
  return data.setting ?? null;
}

export async function createSetting(input: {
  key: string;
  settingType: string;
  value: unknown;
  description?: string;
  isActive?: boolean;
}): Promise<ApiSetting> {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_SETTING,
    variables: { input },
  });
  return data.createSetting;
}

export async function updateSetting(
  key: string,
  input: {
    settingType?: string;
    value?: unknown;
    description?: string;
    isActive?: boolean;
  },
): Promise<ApiSetting> {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_SETTING,
    variables: { key, input },
  });
  return data.updateSetting;
}

export async function deleteSetting(key: string): Promise<void> {
  await apolloClient.mutate({ mutation: DELETE_SETTING, variables: { key } });
}

export async function bulkAction(
  filter: { q?: string; type?: string; active?: boolean },
  action: "activate" | "deactivate" | "delete",
): Promise<BulkResult> {
  const { data } = await apolloClient.mutate({
    mutation: BULK_ACTION,
    variables: { filter, action },
  });
  return data.bulkAction;
}

export async function getAuditLog(params?: {
  setting_key?: string;
  action?: string;
  changed_by?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}): Promise<AuditPage> {
  const { data } = await apolloClient.query({
    query: AUDIT_LOG,
    variables: params,
  });
  return data.auditLog;
}

export async function getSettingHistory(
  key: string,
  params?: { page?: number; per_page?: number },
): Promise<AuditEntry[]> {
  const { data } = await apolloClient.query({
    query: SETTING_HISTORY,
    variables: { key, ...params },
  });
  return data.settingHistory;
}

// ─── Legacy shape aliases (for components not yet migrated) ────────────────
// These map the new camelCase GQL shapes to the old snake_case names so
// existing components continue to compile during incremental migration.

export type { ApiSetting as LegacySetting };
