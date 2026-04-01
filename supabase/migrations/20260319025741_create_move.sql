CREATE Table move (
  id bigint primary key generated always as identity,
  name text NOT NULL UNIQUE,
  type bigint NOT NULL,
  base_power int,
  category text NOT NULL,
  FOREIGN KEY (type) REFERENCES type(id)
)