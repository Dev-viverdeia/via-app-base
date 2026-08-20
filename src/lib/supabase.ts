import { createClient } from "@supabase/supabase-js";

/**
 * Cliente unico do Supabase para todo o app.
 *
 * As duas variaveis abaixo sao injetadas na publicacao e no preview; em
 * desenvolvimento elas vem do arquivo .env local. Nao troque os nomes.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const chavePublica = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(url, chavePublica);
