import request from 'request-promise'
import XmlStream from 'xml-stream'
import stream from 'stream'
import unzip from 'unzip-stream'
import config from '../config'
import { pool } from '../db'

const log = console.log
const error = console.error
const memoryUsage = () => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024
  console.info(`The script uses approximately ${used} MB`)
}

const { idex } = config;

/**
 * Process fn
 */
(async function () {
  try {
    let body = await request({
      url: `${idex.url}${idex.urlFullInventory}?String_Access=${idex.accessKey}`,
      encoding: null
    })

    const bufferStream = new stream.PassThrough()
    bufferStream.end(body)

    await new Promise(async (resolve, reject) => {
      bufferStream.pipe(unzip.Parse())
        .on('entry', async (entry) => {
          let xmlStream = new XmlStream(entry)

          xmlStream.on('startElement item', async (item) => {
            // memoryUsage()

            try {
              xmlStream.pause()

              await pool.query('INSERT INTO `catalog` (`external_id`, `tel`, `email`, `data`) VALUES (' + pool.escape(item.$.id) + ', ' + pool.escape(item.$.tel) + ', ' + pool.escape(item.$.eml) + ', ' + pool.escape(JSON.stringify(item.$)) + ')')
              log('\x1b[32m✔ Inserted position with id \x1b[33m' + item.$.id)

              xmlStream.resume()
            } catch (e) {
              error('\x1b[31m✖ Error inserted position with id ' + item.$.id)
              reject(e)
            }
          })

          xmlStream.on('end', () => {
            // log('============> end stream')
            resolve()
          })

          xmlStream.on('error', reject)
        })
        .on('error', async (err) => {
          reject(err)
        })
    })
  } catch (e) {
    error(e)
  }
})()
