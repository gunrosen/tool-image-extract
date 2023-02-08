const AWS = require('aws-sdk')
const puppeteer = require('puppeteer')
// const cron = require('node-cron');
// Set up credentials for AWS
AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '/o7tmcz/tfMqDrciscEf6O76NFyo6RmS',
})
const time_frames = ['24h', '7d', '30d']
const base_url = 'https://frontend-v2-kingwisdomdev.vercel.app/report-template/'
const urls = [
    'top10-percent-social',
    // 'top10-percent-uaw',
    // 'top10-social-score',
    // 'top10-uaw',
]
const date = new Date()
const date_string = ${date.getDate()}-${date.getMonth()}-${date.getFullYear()}
// Set up S3 client
const s3 = new AWS.S3()
const generateImage = async (url, time_frame) => {
        const browser = await puppeteer.launch()

        // Create a new page
        const page = await browser.newPage()

        // Load the HTML file from your local filesystem
        await page.goto(`${base_url}${url}?time_frame=${time_frame}&date=${date_string}`, { waitUntil: 'networkidle2' })

        await page.waitForSelector('#content') // wait for the selector to load
        const element = await page.$('#content') // declare a variable with an ElementHandle
        await page.setViewport({ width: 1920, height: 1080 }) // This is ignored

        // Take a screenshot and save it to a file
        const imageBuffer = await element.screenshot()

        // Close the browser
        // await browser.close()

        // Upload the image to your S3 bucket
        const params = {
            Bucket: 'bucket-name',
            Key: report-template-${url}-${time_frame}-${date_string}.png,
            Body: imageBuffer,
        }
        s3.upload(params, (err, data) => {
            if (err) {
                console.error(err)
            } else {
                console.log(data)
                console.log(`HTML template saved to S3: ${data.Location}`)
            }
        })
    }

// cron.schedule('0 0 * * *', async () => {

// });
;(async () => {
    for (const url of urls) {
        for (const time_frame of time_frames) {
            await generateImage(url, time_frame)
        }
    }
})()