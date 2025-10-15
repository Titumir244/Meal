/**
 * মাসিক হিসাব ও খরচ ট্র্যাকার - Google Sheets থেকে ডেটা লোড করে বিভিন্ন ট্যাবে প্রদর্শন
 * @author [MD FERDAUS ALAM]
 * @version 1.0
 * @description এই স্ক্রিপ্টটি Google Sheets থেকে CSV ডেটা পড়ে বিভিন্ন ট্যাবে টেবিল আকারে প্রদর্শন করে
 */

const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqrXoiSJndnVDYSBuQTrtI3rDYlzDACY1Prad6FkE5p8ytGCGDNnmxRg3H3A9aYg/pub?gid=646586436&single=true&output=csv";

// ================== ট্যাব ফাংশনালিটি =================
/**
 * ট্যাব ইন্টারফেস ইনিশিয়ালাইজেশন
 * বিভিন্ন সেকশনের মধ্যে নেভিগেশনের ব্যবস্থা করে
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const sections = {
        "মোট হিসাব": document.querySelector(".summary"),
        "মিল": document.querySelector(".mil"),
        "জমা ও হিসাব": document.querySelector(".joma"),
        "বাজার": document.querySelector(".bazar")
    };

    // সব সেকশন লুকানো এবং শুধু প্রথম সেকশন দেখানো
    Object.values(sections).forEach(sec => sec.classList.remove("show"));
    sections["মোট হিসাব"].classList.add("show");
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabButtons[0].classList.add("active");

    // ট্যাব বাটনে ক্লিক ইভেন্ট যোগ করা
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // সব সেকশন লুকানো
            Object.values(sections).forEach(sec => sec.classList.remove("show"));
            
            // ক্লিক করা ট্যাবের对应 সেকশন দেখানো
            const sectionName = btn.textContent.trim();
            const sec = sections[sectionName];
            if (sec) sec.classList.add("show");
            
            // সব ট্যাব নিষ্ক্রিয় এবং বর্তমান ট্যাব সক্রিয় করা
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

// ================== টেবিল বিল্ডার =================
/**
 * ডাইনামিকভাবে টেবিল তৈরি করে
 * @param {string} targetId - টার্গেট টেবিল আইডি
 * @param {Array} rows - CSV ডেটার row গুলো
 * @param {Array} wantedCols - প্রয়োজনীয় কলামের ইনডেক্স
 */
function buildTable(targetId, rows, wantedCols) {
    const tbody = document.querySelector(`#${targetId} tbody`);
    tbody.innerHTML = "";

    // যদি কোনো ডেটা না থাকে
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

    // প্রতিটি row এর জন্য টেবিল row তৈরি
    rows.forEach(row => {
        const tr = document.createElement("tr");
        wantedCols.forEach(colIndex => {
            const td = document.createElement("td");
            let cellValue = row[colIndex] || "";
            
            // সংখ্যা ফরম্যাট করা (কমা সেপারেটর সহ)
            if (!isNaN(cellValue) && cellValue.trim() !== "") {
                cellValue = parseFloat(cellValue).toLocaleString('bn-BD');
            }
            
            td.textContent = cellValue;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// ================== Bangla -> English সংখ্যা কনভার্টার =================
/**
 * বাংলা সংখ্যাকে ইংরেজি সংখ্যায় রূপান্তর করে
 * @param {string} bnStr - বাংলা সংখ্যা স্ট্রিং
 * @returns {string} ইংরেজি সংখ্যা স্ট্রিং
 */
function banglaToEnglishNumber(bnStr) {
    const bnNums = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    const enNums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let enStr = bnStr;
    bnNums.forEach((bn, i) => { 
        enStr = enStr.replace(new RegExp(bn, "g"), enNums[i]); 
    });
    return enStr;
}

// ================== টেবিল ৫ রঙ করা =================
/**
 * টেবিল ৫ এর নির্দিষ্ট শর্ত অনুযায়ী রো এবং সেল রঙ করে
 * - কলাম ৪ এর মান অনুযায়ী রঙ
 * - জমা ও খরচের তুলনা অনুযায়ী নামের রঙ
 */
function colorTable5() {
    const table = document.getElementById("table5");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(tr => {
        const tdName = tr.children[1];      // নাম কলাম
        const tdJoma = tr.children[4];      // জমা কলাম
        const tdKhoroch = tr.children[6];   // খরচ কলাম
        const tdCol4 = tr.children[3];      // ৪র্থ কলাম (বিশেষ স্ট্যাটাস)

        if (!tdName || !tdJoma || !tdKhoroch || !tdCol4) return;

        // সংখ্যা কনভার্ট এবং পার্স
        const valJoma = parseFloat(banglaToEnglishNumber(tdJoma.textContent.replace(/,/g, ''))) || 0;
        const valKhoroch = parseFloat(banglaToEnglishNumber(tdKhoroch.textContent.replace(/,/g, ''))) || 0;
        const valCol4 = tdCol4.textContent.trim();

        // ৪র্থ কলামের মান অনুযায়ী রঙ
        if (valCol4 === "১") tdCol4.style.color = "#f87171";    // লাল
        else if (valCol4 === "২") tdCol4.style.color = "#34d399"; // সবুজ

        // জমা-খরচ তুলনা অনুযায়ী নামের রঙ
        if (valJoma > valKhoroch) tdName.style.color = "#34d399";    // সবুজ (জমা বেশি)
        else if (valJoma < valKhoroch) tdName.style.color = "#f87171"; // লাল (খরচ বেশি)
        else tdName.style.color = "#60a5fa";                         // নীল (সমান)
    });
}

// ================== খালি row লুকানোর ফাংশন =================
/**
 * নির্দিষ্ট কলাম খালি থাকলে row লুকিয়ে দেয়
 * @param {string} tableId - টেবিল আইডি
 * @param {Array} colIndexes - চেক করার কলাম ইনডেক্স
 */
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

// ================== খালি columns লুকানোর ফাংশন =================
/**
 * টেবিলের খালি কলামগুলো রিমুভ করে
 * @param {string} tableId - টেবিল আইডি
 */
function removeEmptyColumns(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    if (!thead || !tbody) return;

    const allRows = [...thead.rows, ...tbody.rows];
    const rowCount = allRows.length;

    // logical matrix তৈরি (rowspan aware)
    const matrix = [];
    const cellMatrix = []; // physical cell reference
    for (let r = 0; r < rowCount; r++) {
        matrix[r] = [];
        cellMatrix[r] = [];
    }

    // ম্যাট্রিক্স পপুলেট করা
    for (let r = 0; r < rowCount; r++) {
        const row = allRows[r];
        let colIndex = 0;
        for (let c = 0; c < row.cells.length; c++) {
            const cell = row.cells[c];
            const colspan = parseInt(cell.colSpan) || 1;
            const rowspan = parseInt(cell.rowSpan) || 1;

            // free index খুঁজে বের করা
            while (matrix[r][colIndex] !== undefined) colIndex++;

            // rowspan এবং colspan হ্যান্ডেল করা
            for (let i = 0; i < rowspan; i++) {
                for (let j = 0; j < colspan; j++) {
                    const rr = r + i;
                    const cc = colIndex + j;
                    matrix[rr][cc] = true; // occupancy map
                    cellMatrix[rr][cc] = cell; // physical reference
                }
            }
            colIndex += colspan;
        }
    }

    const maxCols = Math.max(...matrix.map(r => r.length));
    const emptyCols = [];

    // tbody-only check, skip last column (মোট)
    const tbodyStart = thead.rows.length;
    const lastColIndex = maxCols - 1;
    
    // খালি কলাম চেক করা
    for (let c = 0; c < lastColIndex; c++) {
        let isEmpty = true;
        for (let r = tbodyStart; r < rowCount; r++) {
            const cell = cellMatrix[r][c];
            if (cell && cell.textContent.trim() !== "") {
                isEmpty = false;
                break;
            }
        }
        if (isEmpty) emptyCols.push(c);
    }

    // খালি কলাম ডিলিট করা (thead + tbody)
    emptyCols.reverse().forEach(colIndex => {
        for (let r = 0; r < rowCount; r++) {
            const cell = cellMatrix[r][colIndex];
            if (!cell) continue;

            const colspan = parseInt(cell.colSpan) || 1;
            if (colspan > 1) cell.colSpan = colspan - 1;
            else cell.remove();
        }
    });
}

// ================== শতকভিত্তিক সর্বোচ্চ মানের নিচে বর্ডার ==================
/**
 * নির্দিষ্ট টেবিলে শতকভিত্তিক সর্বোচ্চ মানের নিচে বর্ডার যোগ করে
 * @param {string} tableId - টেবিল আইডি
 */
function addBorderAfterMaxInHundreds(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll("tbody tr");
    const values = [];

    // ৩নং কলামের মান সংগ্রহ
    rows.forEach(row => {
        const cell = row.children[2]; // ৩নং কলাম
        if (!cell) return;

        const val = parseInt(banglaToEnglishNumber(cell.textContent.trim()));
        if (!isNaN(val) && val >= 100 && val < 500) {
            values.push({ row, val });
        }
    });

    // প্রতিটি শতকের সর্বোচ্চ মান বের করা
    const maxMap = {};
    values.forEach(({ val }) => {
        const hundred = Math.floor(val / 100);
        if (!maxMap[hundred] || val > maxMap[hundred]) {
            maxMap[hundred] = val;
        }
    });

    // সর্বোচ্চ মানের row এর নিচে বর্ডার যোগ করা
    rows.forEach(row => {
        const cell = row.children[2];
        if (!cell) return;

        const val = parseInt(banglaToEnglishNumber(cell.textContent.trim()));
        const hundred = Math.floor(val / 100);

        if (val >= 100 && val < 500 && maxMap[hundred] === val) {
            row.style.borderBottom = "2px solid #1e3c72";
        } else {
            row.style.borderBottom = "";
        }
    });
}

// ================== CSV পার্সার =================
/**
 * CSV টেক্সটকে array তে রূপান্তর করে
 * @param {string} csvText - CSV টেক্সট
 * @returns {Array} পার্স করা row গুলো
 */
function parseCSV(csvText) {
    return csvText.trim().split("\n").map(r => {
        let result = [], current = '', inQuotes = false;
        
        // কমা সেপারেশন হ্যান্ডেল করা (কোটি উদ্ধৃতি বিবেচনা করে)
        for (let i = 0; i < r.length; i++) {
            const char = r[i];
            if (char === '"') { 
                inQuotes = !inQuotes; 
            }
            else if (char === ',' && !inQuotes) { 
                result.push(current); 
                current = ''; 
            }
            else { 
                current += char; 
            }
        }
        result.push(current);
        return result;
    });
}

// ================== সেল মার্জ ফাংশন =================
/**
 * দুইটি সেলকে একত্রিত করে
 * @param {string} tableId - টেবিল আইডি
 * @param {number} rowIndex - row ইনডেক্স
 * @param {number} col1 - প্রথম কলাম
 * @param {number} col2 - দ্বিতীয় কলাম
 * @param {string} separator - সেপারেটর স্ট্রিং
 */
function mergeTwoCells(tableId, rowIndex, col1, col2, separator = " ") {
    const row = document.querySelector(`#${tableId} tbody tr:nth-child(${rowIndex})`);
    if (row) {
        const td1 = row.querySelector(`td:nth-child(${col1})`);
        const td2 = row.querySelector(`td:nth-child(${col2})`);

        if (td1 && td2) {
            td1.setAttribute("colspan", "2");
            td1.textContent = td1.textContent.trim() + separator + td2.textContent.trim();
            td2.remove();
        }
    }
}

// ================== মেইন এপ্লিকেশন =================
/**
 * DOM কন্টেন্ট লোড হওয়ার পর স্ক্রিপ্ট এক্সিকিউশন শুরু
 */
document.addEventListener("DOMContentLoaded", function () {
    // ট্যাব সিস্টেম ইনিশিয়ালাইজ
    initializeTabs();

    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "block";

    // Google Sheets থেকে ডেটা ফেচ করা
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text();
        })
        .then(csvText => {
            const rows = parseCSV(csvText);

            // কলাম ইনডেক্স ডেফিনিশন
            const cols1 = [38, 39],          // টেবিল ১ এর কলাম
                  cols2 = [41, 42],          // টেবিল ২ এর কলাম
                  cols3 = [45, 46],          // টেবিল ৩ এর কলাম
                  cols4 = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], // টেবিল ৪ এর কলাম
                  cols5 = [37, 38, 39, 41, 42, 44, 45, 46, 47], // টেবিল ৫ এর কলাম
                  cols6 = [49, 50, 51, 52, 53, 54, 55, 56, 57, 58], // টেবিল ৬ এর কলাম
                  cols7 = [49, 50, 51],      // টেবিল ৭ এর কলাম
                  cols8 = [53, 54, 55],      // টেবিল ৮ এর কলাম
                  cols9 = [57, 58, 59];      // টেবিল ৯ এর কলাম

            // বিভিন্ন টেবিল বিল্ড করা
            buildTable("table1", rows.slice(58, 63), cols1);
            buildTable("table2", rows.slice(58, 62), cols2);
            buildTable("table3", rows.slice(58, 63), cols3);
            
            // টেবিল ৪ প্রসেসিং
            buildTable("table4", rows.slice(2, 53), cols4);
            hideEmptyRows("table4", [1]);
            removeEmptyColumns("table4");
            addBorderAfterMaxInHundreds("table4");

            // টেবিল ৪ এর 51তম row মার্জ (মোট row)
            const cell51 = document.querySelector("#table4 tbody tr:nth-child(51) td:nth-child(1)");
            if (cell51) {
                cell51.setAttribute("colspan", "3");
                cell51.textContent = "মোট";
                let next = cell51.nextElementSibling;
                if (next) next.remove();
                next = cell51.nextElementSibling;
                if (next) next.remove();
            }

            // টেবিল ৫ প্রসেসিং
            buildTable("table5", rows.slice(2, 52), cols5);
            hideEmptyRows("table5", [1]);
            addBorderAfterMaxInHundreds("table5");
            colorTable5();
            
            // টেবিল ৬ প্রসেসিং
            buildTable("table6", rows.slice(2, 34), cols6);
            
            // টেবিল ৬ এর 32তম row মার্জ (মোট row)
            const cell32 = document.querySelector("#table6 tbody tr:nth-child(32) td:nth-child(1)");
            if (cell32) {
                cell32.setAttribute("colspan", "3");
                cell32.textContent = "মোট";
                let next = cell32.nextElementSibling;
                if (next) next.remove();
                next = cell32.nextElementSibling;
                if (next) next.remove();
            }

            // অন্যান্য টেবিল বিল্ড
            buildTable("table7", rows.slice(38, 48), cols7);
            buildTable("table8", rows.slice(38, 48), cols8);
            buildTable("table9", rows.slice(38, 48), cols9);

            // বিভিন্ন টেবিলের সেল মার্জ করা
            mergeTwoCells("table2", 3, 1, 2);
            mergeTwoCells("table2", 4, 1, 2);
            mergeTwoCells("table3", 2, 1, 2);
            mergeTwoCells("table3", 3, 1, 2);
            mergeTwoCells("table7", 10, 1, 2);
            mergeTwoCells("table8", 10, 1, 2);
            mergeTwoCells("table9", 10, 1, 2);

            // লোডিং হাইড করা
            loadingElement.style.display = "none";
        })
        .catch(err => {
            console.error("শীট লোড করতে সমস্যা:", err);
            loadingElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ডেটা লোড করতে সমস্যা হয়েছে: ${err.message}`;
            loadingElement.style.color = "#f87171";
        });
});
