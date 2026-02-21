/**
 * CSV / simple-PDF helpers for server-side report generation.
 * Adapted from fleetflow-v02.
 */

export function toCsv(rows: Array<Record<string, string | number | null | undefined>>): string {
    if (!rows.length) return "";

    const headers = Object.keys(rows[0]);
    const escape = (value: string | number | null | undefined) => {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
    };

    const lines = [headers.join(",")];
    for (const row of rows) {
        lines.push(headers.map((h) => escape(row[h])).join(","));
    }

    return lines.join("\n");
}

export function toSimplePdf(title: string, lines: string[]): Uint8Array {
    const safeLines = [title, "", ...lines].map((l) => l.replace(/[()]/g, ""));
    const textCommands = safeLines
        .map((line, i) => `BT /F1 12 Tf 50 ${780 - i * 18} Td (${line}) Tj ET`)
        .join("\n");

    const stream = `${textCommands}\n`;
    const streamLength = stream.length;

    const objects = [
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
        "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
        `5 0 obj << /Length ${streamLength} >> stream\n${stream}endstream endobj`,
    ];

    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [];

    for (const object of objects) {
        offsets.push(pdf.length);
        pdf += `${object}\n`;
    }

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (const offset of offsets) {
        pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return new Uint8Array(Buffer.from(pdf, "utf-8"));
}
