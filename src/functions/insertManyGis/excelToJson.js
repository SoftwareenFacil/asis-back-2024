import xlsx from "xlsx";

export default function getJsonFromExcel(file){
    let wb = xlsx.readFile(file)
    let ws = wb.Sheets['PLANTILLA GI_ASIS']
    let data = xlsx.utils.sheet_to_json(ws)
    return data
}