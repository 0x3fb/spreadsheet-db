import "@total-typescript/ts-reset";
import dotenv from "dotenv";

dotenv.config()
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const endpoint = "https://sheets.googleapis.com/v4/spreadsheets"
interface SheetResp {
    values: string[][],
    range: string
}

class SpreadsheetDB {
    APIKey: string
    sheetId: string
    constructor(ApiKey: string, SheetId?: string, Url?: string) {
        if (!SheetId && !Url) {
            throw new Error("Need URL or SheetID")
        }

        this.APIKey = ApiKey;
        this.sheetId = "";

        if (SheetId) {
            this.sheetId = SheetId
        } else {
            if (!Url) return;
            this.sheetId = this.URLtoSheetId(Url)
        }

        return this
    }
    private URLtoSheetId (Url: string) {
        let data = new URL(Url)
        let path = data.pathname.split("/")
        if (path.length !== 5) {
            throw new Error("Invalid Url")
        }

        return path[3];
    }

    private isSheetResp(data: unknown): data is SheetResp {
        if (typeof data !== "object") return false
        const resp = data as Record<keyof SheetResp, unknown>

        if (!Array.isArray(resp.values)) return false;
        return resp.values.every((e) => Array.isArray(e) && e.every(data => typeof data === "string"));


    }

    async get(sheetName: string, id?: string) {
        const resp = await fetch(`${endpoint}/${this.sheetId}/values/${sheetName}?key=${this.APIKey}`).catch(e => {
                console.error(e) //TODO: Error
                throw new Error("Unknown Error")
            })


        const sheetData = await resp.json();
        if (!this.isSheetResp(sheetData)) throw new Error("Invalid Response")

        const columns = sheetData.values[0]
        sheetData.values.splice(0, 1)

        const map: Map<string, {
            [keys: string]: string
        }> = new Map();

        if (id) {
            const data = sheetData.values.find(data => data[0] === id)?.slice(1)
            if (!data) return map;

            const row: {
                [keys: string]: string
            } = {}
            for (let i = 0; i < columns.slice(1).length; i++) {
                row[columns.slice(1)[i]] = data[i]
            }
            map.set(id, row)
            return map
        }



       for (let i = 0; i < sheetData.values.length; i++) {
           const row: {
               [keys: string]: string
           } = {}
           for (let j = 0; j < columns.length - 1; j++) {
               row[columns.slice(1)[j]] = sheetData.values[i].slice(1)[j]
           }
           map.set(sheetData.values[i][0], row)
       }

        return map;
    }

    async delete() {} // TODO: DELETE
    async create() {} // TODO: CREATE
    async update() {} // TODO: UPDATE

    // async setTable(tableName: string) {
    //
    // }
}

class Sheet {
    column: string[]
    name: string
    index: number
    sheetId: string
    endpoint: string

    constructor(    column: string[],
                    name: string,
                    index: number,
                    sheetId: string,
    ) {
        this.endpoint = "https://sheets.googleapis.com/v4/spreadsheets"
        this.name = name
        this.sheetId = sheetId
        this.column = column
        this.index = index
    }
}

if (!GOOGLE_API_KEY) throw new Error("token not set")


















const start = new Date()
const db = new SpreadsheetDB(GOOGLE_API_KEY, "1xxtovXvHz-gfybYVziiFq3F0MacGZiUm0aRkklMoeXc")

console.table(await db.get("シート1"))
const end = new Date()
console.log(`${end.getTime() - start.getTime()}ms`)