function hello() {
    alert("سیستم سفارشات چاپخانه آماده است!");
}

const SUPABASE_URL = "اینجا Project URL را قرار بده";

const SUPABASE_KEY = "اینجا Publishable key را قرار بده";


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
