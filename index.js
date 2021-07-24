const express = require('express')
const {google} = require('googleapis')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

const spreadsheetId = '1bukQE9APjGA8SvAxTOQzC0uq3H-_dKXc6a4MZI385ps'

const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets", 
})

const getGoogleSheets = async (req, res) => {
    //create client instance
    const client = await auth.getClient()

    //Instant for Google Sheets API
    const googleSheets = google.sheets({version: "v4", auth:client})
    
    return googleSheets
}

class form {
    constructor(favColor, name) {
        this.favColor = favColor
        this.name = name
    }
}

app.get('/', async (req, res) => {
    const googleSheets = await getGoogleSheets()

    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'sheet 1'
    })

    let arr = []

    for(let key in getRows.data.values) {
        let currFavColor = getRows.data.values[key][0]
        let currName = getRows.data.values[key][1]
        arr.push(new form(currFavColor,currName))
    }

    res.send(arr)
})

app.get('/html', async (req, res) => {
    const googleSheets = await getGoogleSheets()

    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'sheet 1'
    })

    let arr = []
    let string = ""

    for(let key in getRows.data.values) {
        let currFavColor = getRows.data.values[key][0]
        let currName = getRows.data.values[key][1]
        arr.push(new form(currFavColor,currName))
    }

    for(let key in arr) {
        string += `<p>${arr[key].name} loves ${arr[key].favColor}</p> <br>`
    }
    res.send(string)
})

app.post('/insert', async (req, res) => {
    const {favColor, name} = req.body

    if(!favColor) {
        res.send('Please type your favorite color')
    }

    if(!name) {
        res.send('Please type your name')
    }

    const googleSheets = await getGoogleSheets()

    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'sheet 1!A:B',
        valueInputOption:"USER_ENTERED",
        resource: {
            values: [
             [favColor,name]   
            ]
        }
    })

    res.send(`Hey ${name}, ${favColor} is a really nice color`)
})

app.listen(1337, (req, res) => {
    console.log('server is running on 1337')
})