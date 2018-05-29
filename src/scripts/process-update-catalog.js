import request from 'request-promise'
import XmlStream from 'xml-stream'
import stream from 'stream'
import unzip from 'unzip-stream'
import config from '../config'
import { pool } from '../db'

const log = console.log
const error = console.error

const { idex } = config

/**
 * Start stream for response data
 * @param buffer
 * @returns {Promise<void>}
 */
const startStream = async (buffer) => {
  const bufferStream = new stream.PassThrough()
  bufferStream.end(buffer)

  await new Promise(async (resolve, reject) => {
    bufferStream.pipe(unzip.Parse())
      .on('entry', async (entry) => {
        let xmlStream = new XmlStream(entry)
        xmlStream.on('startElement item', async (item) => {
          try {
            xmlStream.pause()

            await performQueries(item.$)
            log('\x1b[32m✔ Perform query for position with id \x1b[33m' + item.$.id)

            xmlStream.resume()
          } catch (e) {
            error('\x1b[31m✖ Error inserted position with id ' + item.$.id)
            reject(e)
          }
        })

        xmlStream.on('end', () => {
          // log('end stream')
          resolve()
        })

        xmlStream.on('error', reject)
      })
      .on('error', async (err) => {
        reject(err)
      })
  })
}

/**
 * Update catalog table from request data
 * @param {Object} item - position data
 * @returns {Promise<void>}
 */
const performQueries = async (item) => {
  try {
    if (item.status === 'deleted') {
      await pool.query('DELETE FROM `catalog` WHERE `external_id` = ' + pool.escape(item.id))
    } else {
      await pool.query('INSERT INTO `catalog` (`external_id`, `tel`, `email`, `data`) ' +
        'VALUES (' + pool.escape(item.id) + ', ' + pool.escape(item.tel) + ', ' + pool.escape(item.eml) + ', ' + pool.escape(JSON.stringify(item)) + ')')
    }
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') {
      throw new Error(e)
    }

    await pool.query('UPDATE `catalog` SET `tel` = ' + pool.escape(item.tel) + ', `email` = ' + pool.escape(item.eml) + ', `data` = ' + pool.escape(JSON.stringify(item)) + ' WHERE `external_id` = ' + pool.escape(item.id) + '')
  }
}

/**
 * Process fn
 */
(async function () {
  try {
    let body = await request({
      url: `${idex.url}${idex.urlUpdateInventory}?String_Access=${idex.accessKey}`,
      encoding: null
    })

    await startStream(body)
  } catch (e) {
    error('\x1b[31m' + e.message)
  }
})()
