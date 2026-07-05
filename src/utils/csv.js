/**
 * Minimal CSV parser supporting quoted cells, escaped quotes ("") and CRLF.
 * Returns an array of rows; blank rows are dropped.
 */
export function parseCsv(csv) {
    const rows = []
    let row = []
    let cell = ''
    let inQuotes = false

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i]
        const next = csv[i + 1]

        if (char === '"') {
            if (inQuotes && next === '"') {
                cell += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            row.push(cell)
            cell = ''
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && next === '\n') i++
            row.push(cell)
            if (row.some(value => value.trim())) rows.push(row)
            row = []
            cell = ''
        } else {
            cell += char
        }
    }

    row.push(cell)
    if (row.some(value => value.trim())) rows.push(row)

    return rows
}
