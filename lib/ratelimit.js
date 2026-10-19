// Counts recent events per key in the database. Returns false if over the limit.
export async function allow(db, key, max, windowSeconds) {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error } = await db
    .from('rate_events')
    .select('id', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', since);
  if (error) throw error;
  if ((count || 0) >= max) return false;
  const { error: insertError } = await db.from('rate_events').insert({ key });
  if (insertError) throw insertError;
  return true;
}

// Occasionally deletes old rows so the table stays small.
export async function cleanup(db) {
  if (Math.random() > 0.05) return;
  const cutoff = new Date(Date.now() - 31 * 86400 * 1000).toISOString();
  await db.from('rate_events').delete().lt('created_at', cutoff);
}
