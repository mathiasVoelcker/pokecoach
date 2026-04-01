CREATE TABLE pokemon_moves (
  id bigint primary key generated always as identity,
  pokemon_id bigint NOT NULL,
  move_id bigint NOT NULL,
  FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
  FOREIGN KEY (move_id) REFERENCES move(id)
)