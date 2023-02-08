require('dotenv').config()

const AWS = require('aws-sdk')
const puppeteer = require('puppeteer')
// const cron = require('node-cron');
// Set up credentials for AWS
AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '/o7tmcz/tfMqDrciscEf6O76NFyo6RmS',
})
const TIMEFRAMES = ['24h', '7d', '30d']

const REPORT_TYPES = [
    'top-percent-uaw'
    // 'top10-percent-social',
    // 'top10-percent-uaw',
    // 'top10-social-score',
    // 'top10-uaw',
]

// Set up S3 client
const s3 = new AWS.S3()
const generateImage = async (date, reportType, timeFrame) => {
        const browser = await puppeteer.launch({headless: true})
        const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        try {
            // Create a new page
            const page = await browser.newPage()

            // Load the HTML file from your local filesystem
            const url = `${process.env.BASE_REPORT_URL}/${reportType}?time_frame=${timeFrame}&date=${dateStr}`
            console.log(`start: ${url}`)
            await page.setViewport({width: 1920, height: 1080}) // This is ignored
            await page.goto(url, {waitUntil: 'networkidle2'})
            await page.waitForSelector('#content') // wait for the selector to load
            const element = await page.$('#content') // declare a variable with an ElementHandle

            const fileName = `${dateStr}-${reportType}-${timeFrame}`
            // Take a screenshot and save it to a file
            await element.screenshot({path: `images/${fileName}.png`});

            console.log(`Done: ${url}`)
            // Upload the image to your S3 bucket
            // const params = {
            //     Bucket: 'bucket-name',
            //     Key: report-template-${url}-${time_frame}-${date_string}.png,
            //     Body: imageBuffer,
            // }
            // s3.upload(params, (err, data) => {
            //     if (err) {
            //         console.error(err)
            //     } else {
            //         console.log(data)
            //         console.log(`HTML template saved to S3: ${data.Location}`)
            //     }
            // })
        } catch (e) {
            console.error(e)
            throw e
        } finally {
            // Close the browser
            await browser.close()
        }
    }
// cron.schedule('0 0 * * *', async () => {

// });
;(async () => {
    const today = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 10)
    let total = 0, done = 0
    for (let temp = from; temp.getTime() < today.getTime(); temp.setDate(temp.getDate() + 1)) {
        for (const url of REPORT_TYPES) {
            for (const time_frame of TIMEFRAMES) {
                total++
                try {
                    await generateImage(temp, url, time_frame)
                    done++
                } catch (e) {

                }
            }
        }
    }
    console.log(`${done}/${total}`)

})()