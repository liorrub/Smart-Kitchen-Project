import "./DataTable.css";

// Reusable table component used across admin pages
function DataTable({
                       columns,
                       data
                   }) {

    if (!data?.length) {

        return (
            <div className="data-table-empty">
                <p>
                    No data available.
                </p>
            </div>
        );
    }

    return (

        // Wrapper scrolls horizontally on its own so a wide table (many
        // columns, or long cell content) never forces the whole page to
        // scroll sideways.
        <div className="data-table-wrapper">
            <table className="data-table">

                <thead>

                <tr>

                    {
                        columns.map(
                            column => (

                                <th
                                    key={column.key}
                                >
                                    {column.label}
                                </th>

                            )
                        )
                    }

                </tr>

                </thead>

                <tbody>

                {
                    data.map(
                        row => (

                            <tr
                                key={
                                    row.id ||
                                    row.userId ||
                                    row.ingredientId ||
                                    row.historyId
                                }
                            >

                                {
                                    columns.map(
                                        column => {
                                            const cellValue = column.render
                                                ? column.render(row)
                                                : row[column.key];

                                            // Only strings/numbers can safely take a title
                                            // tooltip and word-break class; custom renderers
                                            // (badges, buttons, etc.) render as-is.
                                            const isPlainText =
                                                typeof cellValue === "string" ||
                                                typeof cellValue === "number";

                                            const displayValue =
                                                cellValue === null ||
                                                cellValue === undefined ||
                                                cellValue === ""
                                                    ? "—"
                                                    : cellValue;

                                            return (
                                                <td
                                                    key={column.key}
                                                    className={isPlainText ? "sk-text-wrap" : ""}
                                                    title={isPlainText ? String(displayValue) : undefined}
                                                >
                                                    {displayValue}
                                                </td>
                                            );
                                        }
                                    )
                                }

                            </tr>

                        )
                    )
                }

                </tbody>

            </table>
        </div>

    );
}

export default DataTable;