const SUPABASE_URL = "https://tujcsmurmojnnkhavglf.supabase.co";

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

async function loadCustomers() {

    const tableBody = document.getElementById(
        "customers-table-body"
    );

    const { data, error } = await supabaseClient
        .from("customers")
        .select(`
            id,
            customer_no,
            name,
            phone,
            address,
            description,
            type,
            created_at
        `)
        .order("id", {
            ascending: false
        });

    if (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    خطا در دریافت مشتریان
                </td>
            </tr>
        `;

        return;
    }

    if (!data || data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    هنوز مشتری ثبت نشده است.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = "";

    data.forEach(customer => {

        const typeText =
            customer.type === "credit"
                ? "نسیه"
                : "نقدی";

        const typeClass =
            customer.type === "credit"
                ? "customer-type-credit"
                : "customer-type-cash";

        tableBody.innerHTML += `

            <tr>

                <td>
                    ${customer.customer_no ?? "-"}
                </td>

                <td>
                    ${customer.name ?? "-"}
                </td>

                <td>
                    ${customer.phone ?? "-"}
                </td>

                <td class="${typeClass}">
                    ${typeText}
                </td>

                <td>
                    <button
                        onclick="viewCustomer(${customer.id})"
                    >
                        مشاهده
                    </button>
                </td>

            </tr>

        `;
    });
}

loadCustomers();

const addCustomerBtn =
    document.getElementById("add-customer-btn");

const customerFormContainer =
    document.getElementById("customer-form-container");

const closeCustomerForm =
    document.getElementById("close-customer-form");

const cancelCustomerBtn =
    document.getElementById("cancel-customer");

const customerForm =
    document.getElementById("customer-form");


addCustomerBtn.addEventListener("click", () => {

    customerFormContainer.classList.remove("hidden");

});


closeCustomerForm.addEventListener("click", () => {

    customerFormContainer.classList.add("hidden");

});


cancelCustomerBtn.addEventListener("click", () => {

    customerForm.reset();

    customerFormContainer.classList.add("hidden");

});
