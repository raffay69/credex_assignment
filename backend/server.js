import express from "express"
import cors from "cors"
import { audit_engine } from "./engine.js"
import { prisma } from "./db.js"
import { Resend } from 'resend';
import fs from "fs"
import { generatePDF } from "./pdf.js";
import "dotenv/config"
import { dirname } from "path";
import { fileURLToPath } from "url";
import { rateLimit } from 'express-rate-limit'


const __dirname = dirname(fileURLToPath(import.meta.url))
const resend = new Resend(process.env.RESEND_API_KEY);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
    message : { error: 'Too many requests, please try again later.' }
})


const app = express()
const PORT = 3000

app.use(cors())
app.use(limiter)
app.use(express.json())


app.post("/audit" , async (req , res)=>{
    const { data } = req.body
    const response = await audit_engine(data)
    const saved = await prisma.audits.create({
        data : {
            content : JSON.stringify(response)
        }
    })
    const finalRespone = { ...response , id : saved.id }    
    res.json(finalRespone).status(200)
})

app.post("/share" , async(req , res)=>{
    const { id } = req.body
    const data = await prisma.audits.findFirst({
        where : {
            id : id
        }
    })
    res.json(JSON.parse(data.content)).status(200)  
})


app.post("/email" , async (req , res)=>{
    const { email , id } = req.body
    // store the email in db
    await prisma.emails.create({
        data : {
            email
        }
    })
    const rawData = await prisma.audits.findFirst({
        where : {
            id
        }
    })
    const data = JSON.parse(rawData.content)
    // generate the pdf
    generatePDF(data)
    // send the email using resend
    const filepath = `${__dirname}/audit_report.pdf`;
    const attachment = fs.readFileSync(filepath).toString('base64');

    await resend.emails.send({
    from: 'Credex <onboarding@resend.dev>',
    to: [email],
    subject: `We found $${data.monthlySave}/mo in potential savings`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-w-2xl; margin: 0 auto;">
            <p>Hi,</p>
            
            <p>Thank you for requesting an audit. Your personalized stack optimization report is attached.</p>
            
            <p>We noticed some significant high-savings opportunities in your results. To ensure you get the most out of this data, a member of the Credex team will follow up soon to help you map out an optimization strategy.</p>

            <p>Please review the attached PDF, and we'll be in touch shortly!</p>

            <p>Cheers,<br>
            <strong>The Credex Team</strong></p>
            </div>`,
    attachments: [
        {
        content: attachment,
        filename: 'audit_report.pdf',
        },
    ],
    });
    // delete the local file
    fs.unlinkSync(filepath)

    res.sendStatus(200)
})



app.listen(PORT , ()=>{
    console.log(`Listening on ${PORT}`)
})