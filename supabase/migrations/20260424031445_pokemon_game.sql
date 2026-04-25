CREATE TABLE pokemon_game (
  id bigint primary key generated always as identity,
  pokemon_id bigint NOT NULL,
  game_id bigint NOT NULL,
  FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
  FOREIGN KEY (game_id) REFERENCES game(id)
)