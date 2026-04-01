CREATE TABLE ability (
  id bigint primary key generated always as identity,
  name text NOT NULL UNIQUE
)