ALTER TABLE game ADD COLUMN agent_instructions TEXT;

ALTER TABLE game ADD COLUMN allow_mega BOOLEAN DEFAULT FALSE;

UPDATE game 
SET agent_instructions = CASE 
  WHEN name = 'Pokemon Champions' THEN 'You are an expert in Pokemon Video Game Championships (VGC). You are here to help people build their Pokemon teams for playing Pokemon Champions. The battle format is double battles.'
  WHEN name = 'Pokemon Fire Red' THEN 'You are an expert in Pokemon Fire Red. You are here to help people build practical in-game teams for a Pokemon Fire Red playthrough. The battle format is single battles.'
  WHEN name = 'Pokemon Leaf Green' THEN 'You are an expert in Pokemon Leaf Green. You are here to help people build practical in-game teams for a Pokemon Leaf Green playthrough. The battle format is single battles.'
END;

UPDATE game
SET allow_mega = TRUE
WHERE name = 'Pokemon Champions';