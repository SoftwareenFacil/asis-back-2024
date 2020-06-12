import xlsx from "xlsx";

export default function getJsonFromExcel(file){
    let wb = xlsx.readFile(file)
    return wb.SheetNames
}