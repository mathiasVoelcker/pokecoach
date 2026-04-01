CREATE TABLE type (
  id bigint primary key generated always as identity,
  name text NOT NULL UNIQUE,
  color text NOT NULL
)