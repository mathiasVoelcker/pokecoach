CREATE TABLE item (
  id bigint primary key generated always as identity,
  name text NOT NULL,
  description text
)