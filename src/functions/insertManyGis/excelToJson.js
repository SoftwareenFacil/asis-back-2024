import xlsx from "xlsx";

export default function getJsonFromExcel(file, name){
    let wb = xlsx.readFile(file)
    let ws = wb.Sheets[name]
    let data = xlsx.utils.sheet_to_json(ws)
    return data
}