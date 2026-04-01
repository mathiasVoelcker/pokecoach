CREATE TABLE pokemon_abilities (
  id bigint primary key generated always as identity,
  pokemon_id bigint NOT NULL,
  ability_id bigint NOT NULL,
  FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
  FOREIGN KEY (ability_id) REFERENCES ability(id)
)