const SUPABASE_URL = "tujcsmurmojnnkhavglf";

const SUPABASE_KEY = "sb_publishable_IkpCvlrLg7a1oQQrqXzBHg_tRJ6HJFY";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


async function testConnection() {

    const status = document.getElementById(
        "connection-status"
    );

    try {

        const { data, error } = await supabaseClient
            .from("customers")
            .select("id")
            .limit(1);

        if (error) {
            throw error;
        }

        status.textContent =
            "✅ اتصال به دیتابیس با موفقیت انجام شد";

        console.log("Supabase connected:", data);

    } catch (error) {

        status.textContent =
            "❌ اتصال به دیتابیس انجام نشد";

        console.error("Supabase Error:", error);
    }
}


testConnection();

function hello() {
    alert("سیستم سفارشات چاپخانه آماده است!");
}

