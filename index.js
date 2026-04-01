import express from 'express';
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 3000;

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.get('/', async (req, res) => {
  const { data, error } = await supabase.from('pokemon').select('name');

  if (error) {
    return res.send(`<pre>Error: ${JSON.stringify(error, null, 2)}</pre>`);
  }

//   res.send(`<p>TESTING<p>`);
  res.send(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
});

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});