/*==================================================
PARTNERS CORP
SUPABASE.JS
CONEXIÓN CENTRAL
==================================================*/


const SUPABASE_URL =
    "https://fdlcuxflzzjlhwaijgap.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_5XdtLXGlNNQqb73CB7LLBw_mN4vqall";


const supabaseClient =
    window.supabase.createClient(

        SUPABASE_URL,

        SUPABASE_KEY

    );