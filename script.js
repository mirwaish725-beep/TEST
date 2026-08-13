// ==========================================
// 1. اتصال به Supabase
// ==========================================

const SUPABASE_URL =
    "https://tujcsmurmojnnkhavglf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IkpCvlrLg7a1oQQrqXzBHg_tRJ6HJFY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// 2. متغیرهای عمومی
// ==========================================

let allCustomers = [];


// ==========================================
// 3. تست اتصال به Supabase
// ==========================================

async function testConnection() {

    const status =
        document.getElementById("connection-status");

    try {

        const { data, error } =
            await supabaseClient
                .from("customers")
                .select("id")
                .limit(1);

        if (error) {
            throw error;
        }

        if (status) {

            status.textContent =
                "✅ اتصال به دیتابیس با موفقیت انجام شد";

        }

        console.log(
            "Supabase connected:",
            data
        );

    } catch (error) {

        if (status) {

            status.textContent =
                "❌ اتصال به دیتابیس انجام نشد";

        }

        console.error(
            "Supabase Error:",
            error
        );
    }
}


// ==========================================
// 4. دریافت مشتریان از دیتابیس
// ==========================================

async function loadCustomers() {

    const tableBody =
        document.getElementById(
            "customers-table-body"
        );

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="5">
                در حال دریافت مشتریان...
            </td>
        </tr>
    `;


    const { data, error } =
        await supabaseClient
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


    // اگر خطا وجود داشت
    if (error) {

        console.error(
            "Load customers error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    خطا در دریافت مشتریان
                </td>
            </tr>
        `;

        return;
    }


    // ذخیره مشتریان در متغیر
    allCustomers = data || [];


    // اگر مشتری وجود نداشت
    if (allCustomers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    هنوز مشتری ثبت نشده است.
                </td>
            </tr>
        `;

        return;
    }


    // نمایش مشتریان
    renderCustomers(allCustomers);
}


// ==========================================
// 5. نمایش مشتریان در جدول
// ==========================================

function renderCustomers(customers) {

    const tableBody =
        document.getElementById(
            "customers-table-body"
        );

    if (!tableBody) {
        return;
    }


    // اگر نتیجه‌ای وجود نداشت
    if (!customers || customers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    مشتری مورد نظر پیدا نشد.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = "";


    customers.forEach(customer => {

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


// ==========================================
// 6. جستجوی مشتری
// ==========================================

function filterCustomers(searchText) {

    const text =
        searchText.trim().toLowerCase();


    // اگر جستجو خالی بود
    if (!text) {

        renderCustomers(allCustomers);

        return;
    }


    const filteredCustomers =
        allCustomers.filter(customer => {

            const name =
                String(
                    customer.name || ""
                ).toLowerCase();


            const phone =
                String(
                    customer.phone || ""
                ).toLowerCase();


            const customerNo =
                String(
                    customer.customer_no || ""
                ).toLowerCase();


            return (
                name.includes(text) ||
                phone.includes(text) ||
                customerNo.includes(text)
            );

        });


    renderCustomers(filteredCustomers);
}


// ==========================================
// 7. باز کردن فرم مشتری جدید
// ==========================================

const addCustomerBtn =
    document.getElementById(
        "add-customer-btn"
    );


const customerFormContainer =
    document.getElementById(
        "customer-form-container"
    );


const closeCustomerForm =
    document.getElementById(
        "close-customer-form"
    );


const cancelCustomerBtn =
    document.getElementById(
        "cancel-customer"
    );


const customerForm =
    document.getElementById(
        "customer-form"
    );


// دکمه مشتری جدید
if (addCustomerBtn) {

    addCustomerBtn.addEventListener(
        "click",
        () => {

            customerFormContainer
                .classList
                .remove("hidden");

        }
    );

}


// دکمه ×
if (closeCustomerForm) {

    closeCustomerForm.addEventListener(
        "click",
        () => {

            customerFormContainer
                .classList
                .add("hidden");

        }
    );

}


// دکمه لغو
if (cancelCustomerBtn) {

    cancelCustomerBtn.addEventListener(
        "click",
        () => {

            customerForm.reset();

            customerFormContainer
                .classList
                .add("hidden");

        }
    );

}


// ==========================================
// 8. ثبت مشتری جدید
// ==========================================

if (customerForm) {

    customerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const customerNo =
                Number(
                    document.getElementById(
                        "customer-no"
                    ).value
                );


            const name =
                document.getElementById(
                    "customer-name"
                ).value.trim();


            const phone =
                document.getElementById(
                    "customer-phone"
                ).value.trim();


            const type =
                document.getElementById(
                    "customer-type"
                ).value;


            const address =
                document.getElementById(
                    "customer-address"
                ).value.trim();


            const description =
                document.getElementById(
                    "customer-description"
                ).value.trim();


            // بررسی اطلاعات ضروری
            if (!customerNo || !name) {

                alert(
                    "لطفاً شماره مشتری و نام مشتری را وارد کنید."
                );

                return;
            }


            // جلوگیری از شماره مشتری تکراری
            const {
                data: existingCustomer,
                error: checkError
            } = await supabaseClient
                .from("customers")
                .select("id")
                .eq(
                    "customer_no",
                    customerNo
                )
                .maybeSingle();


            if (checkError) {

                console.error(
                    "Check customer error:",
                    checkError
                );

                alert(
                    "خطا هنگام بررسی شماره مشتری:\n" +
                    checkError.message
                );

                return;
            }


            if (existingCustomer) {

                alert(
                    "این شماره مشتری قبلاً استفاده شده است."
                );

                return;
            }


            // ثبت در دیتابیس
            const {
                data,
                error
            } = await supabaseClient
                .from("customers")
                .insert([
                    {
                        customer_no:
                            customerNo,

                        name:
                            name,

                        phone:
                            phone,

                        address:
                            address,

                        description:
                            description,

                        type:
                            type
                    }
                ])
                .select();


            // بررسی خطا
            if (error) {

                console.error(
                    "Insert customer error:",
                    error
                );

                alert(
                    "ثبت مشتری انجام نشد:\n" +
                    error.message
                );

                return;
            }


            console.log(
                "Customer created:",
                data
            );


            alert(
                "✅ مشتری با موفقیت ثبت شد."
            );


            // پاک کردن فرم
            customerForm.reset();


            // بستن فرم
            customerFormContainer
                .classList
                .add("hidden");


            // دوباره دریافت مشتریان
            await loadCustomers();

        }
    );

}


// ==========================================
// 9. جستجوی مشتری
// ==========================================

const customerSearch =
    document.getElementById(
        "customer-search"
    );


if (customerSearch) {

    customerSearch.addEventListener(
        "input",
        () => {

            const searchText =
                customerSearch.value;

            filterCustomers(
                searchText
            );

        }
    );

}


// ==========================================
// 10. مشاهده مشتری
// ==========================================

function viewCustomer(customerId) {

    const customer =
        allCustomers.find(
            item => item.id === customerId
        );


    if (!customer) {

        alert(
            "اطلاعات مشتری پیدا نشد."
        );

        return;
    }


    alert(
        "مشتری:\n\n" +
        "شماره: " +
        customer.customer_no +
        "\n" +
        "نام: " +
        customer.name +
        "\n" +
        "تلفن: " +
        (customer.phone || "-") +
        "\n" +
        "نوع: " +
        (
            customer.type === "credit"
                ? "نسیه"
                : "نقدی"
        )
    );

}


// ==========================================
// 11. اجرای اولیه
// ==========================================

testConnection();

loadCustomers();
