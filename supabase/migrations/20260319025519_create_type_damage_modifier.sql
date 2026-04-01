CREATE TABLE type_damage_modifier (
  id bigint primary key generated always as identity,
  attacking_type bigint NOT NULL,
  defending_type bigint NOT NULL,
  modifier numeric(2,1) NOT NULL,
  FOREIGN KEY (attacking_type) REFERENCES type(id),
  FOREIGN KEY (defending_type) REFERENCES type(id)
)