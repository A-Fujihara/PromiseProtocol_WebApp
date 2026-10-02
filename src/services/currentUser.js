// PP-B5: the one place the requesting user's id comes from. Every page and
// component that sends userId to the API (PP-A6 visibility enforcement
// depends on it) reads it from here instead of keeping its own copy, so
// swapping in real auth (Epic 6) is a one-file change.
export const CURRENT_USER = 'dev_user_001';
