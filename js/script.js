const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqrXoiSJndnVDYSBuQTrtI3rDYlzDACY1Prad6FkE5p8ytGCGDNnmxRg3H3A9aYg/pub?gid=646586436&single=true&output=csv";
// ফাংশন: টেবিলের tbody পূরণ + F হাইলাইট
function buildTable(targetId, rows, wantedCols) {
    const tbody = document.querySelector(`#${targetId} tbody`);
    tbody.innerHTML = "";

    rows.forEach(row => {
        const tr = document.createElement("tr");
        wantedCols.forEach(colIndex => {
            const td = document.createElement("td");
            td.textContent = row[colIndex] || "";

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

fetch(url)
    .then(res => res.text())
    .then(csvText => {
        const rows = csvText.trim().split("\n").map(r => r.split(","));

        // কলাম ইন্ডেক্স (A=0, B=1, ...)
        const cols1 = [38, 39];
        const cols2 = [41, 42];
        const cols3 = [44, 45];
        const cols4 = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
        const cols5 = [37,38, 39, 41, 42, 43, 44, 45];
        const cols6 = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56];
        const cols7 = [48, 49];
        const cols8 = [51, 52];

        // সারি স্লাইস (index 0 থেকে)
        const table1Rows = rows.slice(58, 63);  // 5-19
        const table2Rows = rows.slice(58, 61);  // 5-19
        const table3Rows = rows.slice(58, 62);  // 5-19
        const table4Rows = rows.slice(1, 48); // 25-39
        const table5Rows = rows.slice(1, 47); // 45-59
        const table6Rows = rows.slice(1, 34); // 65-79
        const table7Rows = rows.slice(37, 48); // 85-7
        const table8Rows = rows.slice(37, 48); // 85-7
        

        // টেবিল তৈরি
        buildTable("table1", table1Rows, cols1);
        buildTable("table2", table2Rows, cols2);
        buildTable("table3", table3Rows, cols3);
        buildTable("table4", table4Rows, cols4);
        buildTable("table5", table5Rows, cols5);
        buildTable("table6", table6Rows, cols6);
        buildTable("table7", table7Rows, cols7);
        buildTable("table8", table8Rows, cols8);
    })
    .catch(err => console.error("Error loading sheet:", err));