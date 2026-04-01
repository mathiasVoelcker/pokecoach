CREATE TABLE pokemon (
  id bigint primary key generated always as identity,
  name text NOT NULL UNIQUE,
  first_type bigint NOT NULL,
  second_type bigint,
  base_hp int NOT NULL,
  base_attack int NOT NULL,
  base_defense int NOT NULL,
  base_special_attack int NOT NULL,
  base_special_defense int NOT NULL,
  base_speed int NOT NULL,
  FOREIGN KEY (first_type) REFERENCES type(id),
  FOREIGN KEY (second_type) REFERENCES type(id)
)