const { Client, LocalAuth } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const { default: axios } = require("axios")
const express = require("express")
const bodyParser = require("body-parser")

const client = new Client({
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
  authStrategy: new LocalAuth(),
})

// const apiUrl = "http://localhost:8787"
const apiUrl = "https://ragdoll.radgoll-api.workers.dev"

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
  console.log("Client is ready!")
})
client.on("authenticated", () => {
  console.log("Client is authenticated")
})

// Forward messages
client.on("message", (message) => {
  axios
    .post(`${apiUrl}/wa-message-received`, {
      message,
    })
    .then(function (response) {
      console.log(response)
    })
    .catch(function (error) {
      console.log(error)
    })
})
client.initialize()

// Set up express
const app = express()
const port = 3000

// parse application/json
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.send("Hello Ragdoll!")
})

app.post("/send-message", async (req, res) => {
  console.log("Send message body:", req.body)
  const chatId = req.body.chatId
  const message = req.body.message
  const result = await client.sendMessage(chatId, message)

  res.status(200).json(result)
})

app.post("/start-typing", async (req, res) => {
  console.log("Start typing body:", req.body)
  const chatId = req.body.chatId
  const chat = await client.getChatById(chatId)
  await chat.sendStateTyping()

  res.status(200).json({ success: true })
})

app.post("/stop-typing", async (req, res) => {
  console.log("Stop typing body:", req.body)
  const chatId = req.body.chatId
  const chat = await client.getChatById(chatId)
  await chat.clearState()

  res.status(200).json({ success: true })
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
