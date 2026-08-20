import { createClient } from "@supabase/supabase-js";

/**
 * Cliente único do Supabase para todo o app.
 *
 * As duas variáveis abaixo são injetadas na publicação e no preview; em
 * desenvolvimento elas vêm do arquivo .env local. Não troque os nomes.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const chavePublica = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(url, chavePublica);
