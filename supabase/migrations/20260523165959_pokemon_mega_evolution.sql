ALTER TABLE pokemon
ADD COLUMN mega_evolves_from bigint REFERENCES pokemon(id),
ADD COLUMN artwork_id bigint;
