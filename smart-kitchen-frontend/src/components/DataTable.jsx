// Reusable table component used across admin pages
function DataTable({
                       columns,
                       data
                   }) {

    if (!data?.length) {

        return (
            <p>
                No data available.
            </p>
        );
    }

    return (

        <table
            border="1"
            cellPadding="10"
            cellSpacing="0"
            width="100%"
        >

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
                                    column => (

                                        <td
                                            key={column.key}
                                        >

                                            {
                                                // Use custom renderer if provided
                                                column.render
                                                    ? column.render(row)
                                                    : row[column.key]
                                            }

                                        </td>

                                    )
                                )
                            }

                        </tr>

                    )
                )
            }

            </tbody>

        </table>

    );
}

export default DataTable;