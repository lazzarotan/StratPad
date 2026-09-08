import { Box, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import {InputNumber } from "antd";
import { DataGrid, GridColDef, GridRowsProp} from "@mui/x-data-grid";
import { Typography } from "@mui/material";

export interface TableRow {
    isHeader: boolean;
    cells: string[];
}

interface TableEditorProps {
    tableRows: TableRow[];
    columnCount: number;
    rowCount: number;
    onChange: (tableRows: TableRow[], columnCount: number, rowCount: number) => void;
}


const defaultColDef: GridColDef = {
    field: "",
    headerName: "",
    width: 100,
    editable: true,
    sortable: false, 
    filterable: false,
}

export default function TableEditor({ tableRows, columnCount, rowCount, onChange }: TableEditorProps) {

    const [editedTableRows, setEditedTableRows] = useState<TableRow[]>(tableRows);
    const [editedColumnCount, setEditedColumnCount] = useState<number>(columnCount);
    const [editedRowCount, setEditedRowCount] = useState<number>(rowCount);


    useEffect(() => {
        setEditedTableRows(tableRows);
        setEditedColumnCount(columnCount);
        setEditedRowCount(rowCount);
    }, [tableRows, columnCount, rowCount]);


    function renderDataGrid(){
    

        
    }

    return (

        <Box sx={{ border: "1px solid #ccc", borderRadius: 1, p: 2 }}>
        <Grid container rowSpacing={2} columnSpacing={2} size={12}>
            <Grid size={6}>
                <Typography variant="body2">Columns</Typography>
                <InputNumber
                    mode={"spinner"}
                    min={1}
                    max={10}
                    defaultValue={5}
                    onChange={(value) => setEditedColumnCount(value)}
                />
            </Grid>
            <Grid size={6}>
                <Typography variant="body2">Rows</Typography>
                <InputNumber
                    mode={"spinner"}
                    min={1}
                    max={20}
                    defaultValue={5}
                    onChange={(value) => setEditedRowCount(value)}
                />
            </Grid>

            <Grid size={12}>

            </Grid>
        </Grid>
        </Box>
    )
}