const { Client, LocalAuth } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const { default: axios } = require("axios")

const whatsapp = new Client({
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
  authStrategy: new LocalAuth(),
})

const client = new Client()

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
  console.log("Client is ready!")
})

const apiUrl = "http://localhost:4000"

client.on("message", (message) => {
  axios
    .post(`${apiUrl}/whatsapp-message`, {
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
