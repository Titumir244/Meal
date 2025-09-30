// ==========================
// Configuration Section
// ==========================
const CONFIG = {
    tableSheetURL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Ib1jaojQVFlpH0BgM2YxlYvpOxu_cLAoGwNmWlkCiD2a9Cg-MABkIpGpPLI7yQ/pub?gid=1610874522&single=true&output=csv",
    pdfSheetURL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Ib1jaojQVFlpH0BgM2YxlYvpOxu_cLAoGwNmWlkCiD2a9Cg-MABkIpGpPLI7yQ/pub?gid=289845772&single=true&output=csv",
    
    // Color mapping for different grades
    colorMap: {
        first: "#f9e6ff",
        second: "#e6fff0",
        third: "#fffde6",
        fail: "#fff0f0"
    },
    
    // Table configurations
    tableConfigs: {
        table1: { startRow: 4, endRow: 19, columns: [1, 2, 3, 4, 6, 8, 10, 12, 14, 16] },
        table2: { startRow: 24, endRow: 39, columns: [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] },
        table3: { startRow: 44, endRow: 59, columns: [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] },
        // table4: { startRow: 64, endRow: 79, columns: [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22] },
        // table5: { startRow: 84, endRow: 99, columns: [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] }
    },
    
    // Course IDs for PDF generation
    courseIds: [
        "name", "father", "mother", "regi", "cgpa", "211501", "212707", "212709", 
        "213607", "213608", "213701", "213703", "213705", "213707", "gpa1", "english", 
        "222707", "222708", "223609", "223610", "223701", "223703", "223705", "223706", 
        "gpa2", "233701", "233703", "233705", "233707", "233709", "233711", "233713", 
        "233714", "gpa3", "243701", "243703", "243705", "243707", "243709", "243711", 
        "243713", "243717", "243718", "243720", "gpa4"
    ]
};

// ==========================
// Utility Functions
// ==========================
class Utils {
    /**
     * Parse CSV text into array of rows
     * @param {string} csvText - CSV content as string
     * @returns {Array} Array of rows
     */
    static parseCSV(csvText) {
        return csvText.trim().split("\n").map(row => row.split(","));
    }
    
    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    static showError(message) {
        console.error(message);
        alert(message);
    }
    
    /**
     * Validate required parameters
     * @param {*} params - Parameters to validate
     * @returns {boolean} True if valid
     */
    static validateParams(...params) {
        return params.every(param => param !== undefined && param !== null);
    }
}

// ==========================
// Table Builder Class
// ==========================
class TableBuilder {
    /**
     * Build table with specified configuration
     * @param {string} targetId - ID of the target table element
     * @param {Array} rows - Data rows
     * @param {Array} wantedCols - Column indices to include
     */
    static buildTable(targetId, rows, wantedCols) {
        if (!Utils.validateParams(targetId, rows, wantedCols)) {
            Utils.showError("Invalid parameters for table building");
            return;
        }
        
        const tbody = document.querySelector(`#${targetId} tbody`);
        if (!tbody) {
            Utils.showError(`Table body not found for ID: ${targetId}`);
            return;
        }
        
        tbody.innerHTML = "";
        
        rows.forEach((row) => {
            const tr = this.createTableRow(row, wantedCols, targetId);
            tbody.appendChild(tr);
        });
    }
    
    /**
     * Create a single table row
     * @param {Array} row - Row data
     * @param {Array} wantedCols - Column indices to include
     * @param {string} targetId - Target table ID
     * @returns {HTMLElement} Table row element
     */
    static createTableRow(row, wantedCols, targetId) {
        const tr = document.createElement("tr");
        let rowClass = "";
        
        // Create data cells
        wantedCols.forEach((colIndex) => {
            const td = this.createTableCell(row, colIndex);
            
            // Determine row class based on cell content
            rowClass = this.determineRowClass(td.textContent, rowClass);
            
            tr.appendChild(td);
        });
        
        // Apply row styling
        this.applyRowStyling(tr, rowClass);
        
        // Add VIEW button for table1
        if (targetId === "table1") {
            const viewButtonCell = this.createViewButtonCell(row);
            tr.appendChild(viewButtonCell);
        }
        
        return tr;
    }
    
    /**
     * Create a table cell with content
     * @param {Array} row - Row data
     * @param {number} colIndex - Column index
     * @returns {HTMLElement} Table cell element
     */
    static createTableCell(row, colIndex) {
        const td = document.createElement("td");
        const cellContent = row[colIndex] || "";
        td.textContent = cellContent;
        
        // Highlight "F" grades
        if (cellContent.trim().toUpperCase() === "F") {
            td.style.color = "#ff0000ff";
            td.style.fontWeight = "bold";
        }
        
        return td;
    }
    
    /**
     * Determine row class based on cell content
     * @param {string} cellText - Cell text content
     * @param {string} currentClass - Current row class
     * @returns {string} Updated row class
     */
    static determineRowClass(cellText, currentClass) {
        const text = cellText.trim().toLowerCase();
        
        if (text === "1st") return "first";
        if (text === "2nd") return "second";
        if (text === "3rd") return "third";
        if (text === "fail") return "fail";
        
        return currentClass;
    }
    
    /**
     * Apply styling to table row based on class
     * @param {HTMLElement} tr - Table row element
     * @param {string} rowClass - Row class name
     */
    static applyRowStyling(tr, rowClass) {
        if (rowClass && CONFIG.colorMap[rowClass]) {
            tr.style.backgroundColor = CONFIG.colorMap[rowClass];
        }
    }
    
    /**
     * Create VIEW button cell for table1
     * @param {Array} row - Row data
     * @returns {HTMLElement} Table cell with VIEW button
     */
    static createViewButtonCell(row) {
        const td = document.createElement("td");
        td.textContent = "VIEW";
        td.className = "view-button";
        
        td.addEventListener("click", () => {
            const rollNumber = row[3] || "";
            PDFManager.updatePDF(rollNumber);
            UIManager.showPDFSection();
        });
        
        return td;
    }
}

// ==========================
// PDF Manager Class
// ==========================
class PDFManager {
    /**
     * Update PDF section with student data
     * @param {string} roll - Roll number
     */
    static async updatePDF(roll) {
        try {
            const response = await fetch(CONFIG.pdfSheetURL);
            const text = await response.text();
            const rows = Utils.parseCSV(text);
            
            const student = this.findStudentByRoll(rows, roll);
            if (!student) {
                Utils.showError("রোল নম্বর পাওয়া যায়নি");
                return;
            }
            
            this.populatePDFFields(student);
        } catch (error) {
            console.error("Error fetching PDF data:", error);
            Utils.showError("ডাটা লোড করতে সমস্যা হয়েছে");
        }
    }
    
    /**
     * Find student by roll number
     * @param {Array} rows - All data rows
     * @param {string} roll - Roll number to find
     * @returns {Array|null} Student data or null if not found
     */
    static findStudentByRoll(rows, roll) {
        const dataRows = rows.slice(1); // Skip header
        return dataRows.find(row => row[3] === roll) || null;
    }
    
    /**
     * Populate PDF fields with student data
     * @param {Array} student - Student data
     */
    static populatePDFFields(student) {
        CONFIG.courseIds.forEach((code, idx) => {
            const grade = student[idx] || "";
            const cell = document.getElementById(code);
            
            if (cell) {
                cell.textContent = grade;
                
                if (grade.toUpperCase() === "F") {
                    cell.classList.add("f-grade");
                } else {
                    cell.classList.remove("f-grade");
                }
            }
        });
    }
    
    /**
     * Download PDF
     * @param {string} pdfElementId - ID of the PDF element
     */
    static downloadPDF(pdfElementId) {
        const element = document.getElementById(pdfElementId);
        if (!element) {
            Utils.showError("PDF element not found");
            return;
        }
        
        const options = {
            filename: 'Result.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'px', format: [810, 860], orientation: 'landscape' }
        };
        
        html2pdf().set(options).from(element).save();
    }
}

// ==========================
// UI Manager Class
// ==========================
class UIManager {
    /**
     * Show PDF section and hide table section
     */
    static showPDFSection() {
        const tabSection = document.querySelector(".tab");
        const pdfSection = document.querySelector(".tabl");
        
        if (tabSection) tabSection.style.display = "none";
        if (pdfSection) pdfSection.style.display = "block";
    }
    
    /**
     * Show table section and hide PDF section
     */
    static showTableSection() {
        const tabSection = document.querySelector(".tab");
        const pdfSection = document.querySelector(".tabl");
        
        if (tabSection) tabSection.style.display = "block";
        if (pdfSection) pdfSection.style.display = "none";
    }
}

// ==========================
// Data Loader Class
// ==========================
class DataLoader {
    /**
     * Load and process table data
     */
    static async loadTableData() {
        try {
            const response = await fetch(CONFIG.tableSheetURL);
            const csvText = await response.text();
            const rows = Utils.parseCSV(csvText);
            
            this.buildAllTables(rows);
        } catch (error) {
            console.error("Error loading table data:", error);
            Utils.showError("টেবিল ডাটা লোড করতে সমস্যা হয়েছে");
        }
    }
    
    /**
     * Build all tables from data
     * @param {Array} rows - All data rows
     */
    static buildAllTables(rows) {
        Object.keys(CONFIG.tableConfigs).forEach(tableId => {
            const config = CONFIG.tableConfigs[tableId];
            const tableRows = rows.slice(config.startRow, config.endRow);
            TableBuilder.buildTable(tableId, tableRows, config.columns);
        });
    }
}

// ==========================
// Initialize Application
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    DataLoader.loadTableData();
});

// ==========================
// Global Functions (for HTML onclick)
// ==========================
window.downloadPDF = PDFManager.downloadPDF;






