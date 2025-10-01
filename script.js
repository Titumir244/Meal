const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqrXoiSJndnVDYSBuQTrtI3rDYlzDACY1Prad6FkE5p8ytGCGDNnmxRg3H3A9aYg/pub?gid=646586436&single=true&output=csv";

// ================== ট্যাব ফাংশনালিটি =================
const tabButtons = document.querySelectorAll(".tab-btn");
const sections = {
    "মোট হিসাব": document.querySelector(".summary"),
    "মিল": document.querySelector(".mil"),
    "জমা ও হিসাব": document.querySelector(".joma"),
    "বাজার": document.querySelector(".bazar")
};
Object.values(sections).forEach(sec => sec.classList.remove("show"));
sections["মোট হিসাব"].classList.add("show");
tabButtons.forEach(btn => btn.classList.remove("active"));
tabButtons[0].classList.add("active");

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        Object.values(sections).forEach(sec => sec.classList.remove("show"));
        const sectionName = btn.textContent.trim();
        const sec = sections[sectionName];
        if (sec) sec.classList.add("show");
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

// ================== টেবিল বিল্ডার =================
function buildTable(targetId, rows, wantedCols) {
    const tbody = document.querySelector(`#${targetId} tbody`);
    tbody.innerHTML = "";

    if (rows.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = wantedCols.length;
        td.textContent = "কোন ডেটা পাওয়া যায়নি";
        td.style.textAlign = "center";
        td.style.padding = "20px";
        td.style.color = "#6c757d";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    rows.forEach(row => {
        const tr = document.createElement("tr");
        wantedCols.forEach(colIndex => {
            const td = document.createElement("td");
            let cellValue = row[colIndex] || "";
            if (!isNaN(cellValue) && cellValue.trim() !== "") {
                cellValue = parseFloat(cellValue).toLocaleString('bn-BD');
            }
            td.textContent = cellValue;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// ================== Bangla -> English সংখ্যা =================
function banglaToEnglishNumber(bnStr) {
    const bnNums = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    const enNums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let enStr = bnStr;
    bnNums.forEach((bn, i) => { enStr = enStr.replace(new RegExp(bn, "g"), enNums[i]); });
    return enStr;
}

// ================== টেবিল ৫ রঙ করা =================
function colorTable5() {
    const table = document.getElementById("table5");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(tr => {
        const tdName = tr.children[1];      // পুরাতন শর্তের জন্য (index=1)
        const tdJoma = tr.children[4];
        const tdKhoroch = tr.children[6];
        const tdCol4 = tr.children[3];      // নতুন শর্তের জন্য (index=3)

        if (!tdName || !tdJoma || !tdKhoroch || !tdCol4) return;

        const valJoma = parseFloat(banglaToEnglishNumber(tdJoma.textContent.replace(/,/g, ''))) || 0;
        const valKhoroch = parseFloat(banglaToEnglishNumber(tdKhoroch.textContent.replace(/,/g, ''))) || 0;
        const valCol4 = tdCol4.textContent.trim();

        // ===== নতুন শর্ত: index=3 cell রঙ =====
        if (valCol4 === "০") tdCol4.style.color = "#f87171";      // লাল
        else if (valCol4 === "১") tdCol4.style.color = "#60a5fa"; // ধূসর
        else if (valCol4 === "২") tdCol4.style.color = "#34d399"; // সবুজ

        // ===== পুরাতন শর্ত: index=1 cell রঙ =====
        if (valJoma > valKhoroch) tdName.style.color = "#34d399";
        else if (valJoma < valKhoroch) tdName.style.color = "#f87171";
        else tdName.style.color = "#60a5fa";
    });
}


// ================== খালি row লুকানোর ফাংশন =================
function hideEmptyRows(tableId, colIndexes) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(tr => {
        let hideRow = false;
        colIndexes.forEach(i => {
            const cell = tr.children[i];
            if (!cell || cell.textContent.trim() === "") hideRow = true;
        });
        if (hideRow) tr.style.display = "none";
    });
}

// ================== CSV ফেচ =================
const loadingElement = document.getElementById("loading");
loadingElement.style.display = "block";

fetch(url)
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
    })
    .then(csvText => {
        const rows = csvText.trim().split("\n").map(r => {
            let result = [], current = '', inQuotes = false;
            for (let i = 0; i < r.length; i++) {
                const char = r[i];
                if (char === '"') { inQuotes = !inQuotes; }
                else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
                else { current += char; }
            }
            result.push(current);
            return result;
        });

        // কলাম ইনডেক্স
        const cols1 = [38, 39], cols2 = [41, 42], cols3 = [44, 45], cols4 = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
            cols5 = [37, 38, 39, 41, 42, 43, 44, 45, 46], cols6 = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56], cols7 = [48, 49], cols8 = [51, 52];

        // টেবিল বিল্ড
        buildTable("table1", rows.slice(58, 63), cols1);
        buildTable("table2", rows.slice(58, 62), cols2);
        buildTable("table3", rows.slice(58, 63), cols3);
        buildTable("table4", rows.slice(2, 53), cols4);
        hideEmptyRows("table4", [1]); // table4 column2 খালি row হাইড
        // table4 এর 51তম row এর প্রথম cell-এ colspan
        const cell51 = document.querySelector("#table4 tbody tr:nth-child(51) td:nth-child(1)");
        if (cell51) {
            cell51.setAttribute("colspan", "3");

            // cell-এ টেক্স বসানো
            cell51.textContent = "মোট";

            // পাশের ২টা td মুছে দাও
            let next = cell51.nextElementSibling;
            if (next) next.remove();
            next = cell51.nextElementSibling;
            if (next) next.remove();
        }
        buildTable("table5", rows.slice(2, 52), cols5);
        hideEmptyRows("table5", [1]); // table5 column2 খালি row হাইড
        buildTable("table6", rows.slice(2, 34), cols6);
        // table6 এর 32তম row এর প্রথম cell-এ colspan
        const cell32 = document.querySelector("#table6 tbody tr:nth-child(32) td:nth-child(1)");
        if (cell32) {
            cell32.setAttribute("colspan", "3");

            // cell-এ টেক্স বসানো
            cell32.textContent = "মোট";

            // পাশের ২টা td মুছে দাও
            let next = cell32.nextElementSibling;
            if (next) next.remove();
            next = cell32.nextElementSibling;
            if (next) next.remove();
        }
        buildTable("table7", rows.slice(37, 48), cols7);
        buildTable("table8", rows.slice(37, 48), cols8);
        // =========================
        // 👉 mergeTwoCells ফাংশন
        // =========================
        function mergeTwoCells(tableId, rowIndex, col1, col2, separator = " ") {
            const row = document.querySelector(`#${tableId} tbody tr:nth-child(${rowIndex})`);
            if (row) {
                const td1 = row.querySelector(`td:nth-child(${col1})`);
                const td2 = row.querySelector(`td:nth-child(${col2})`);

                if (td1 && td2) {
                    // colspan = 2
                    td1.setAttribute("colspan", "2");

                    // value জোড়া লাগানো
                    td1.textContent = td1.textContent.trim() + separator + td2.textContent.trim();

                    // দ্বিতীয় cell মুছে ফেলা
                    td2.remove();
                }
            }
        }
        // =========================
        // 👉 table2 তে merge কাজ
        // =========================
        mergeTwoCells("table2", 3, 1, 2); // ৩ নম্বর row: col1+col2
        mergeTwoCells("table2", 4, 1, 2); // ৪ নম্বর row: col1+col2
        // table3 তে merge করা
        mergeTwoCells("table3", 2, 1, 2); // ২ নম্বর row: col1+col2
        mergeTwoCells("table3", 3, 1, 2); // ৩ নম্বর row: col1+col2


        // রঙ করা
        colorTable5();
        loadingElement.style.display = "none";
    })
    .catch(err => {
        console.error("শীট লোড করতে সমস্যা:", err);
        loadingElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ডেটা লোড করতে সমস্যা হয়েছে: ${err.message}`;
        loadingElement.style.color = "#f87171";
    });
