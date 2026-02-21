"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
    data: any[];
    filename: string;
    pdfTitle: string;
}

export function ExportButtons({ data, filename, pdfTitle }: ExportButtonsProps) {
    const handleExportCSV = () => {
        if (!data || data.length === 0) return;
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (!data || data.length === 0) return;
        const doc = new jsPDF();
        doc.text(pdfTitle, 14, 15);

        // Extract headers from the first object keys
        const headers = Object.keys(data[0]).map(k => k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'));
        // Extract rows
        const rows = data.map(obj => Object.values(obj) as any[]);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
                <FileSpreadsheet className="h-4 w-4" />
                CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
                <FileText className="h-4 w-4" />
                PDF
            </Button>
        </div>
    );
}
