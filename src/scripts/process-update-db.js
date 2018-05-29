import path from 'path'
import fs from 'fs'
import connect from '../db/connect'
import config from '../config'

const { connectionLimit, host, user, password, database } = config.db
const pool = connect({ connectionLimit, host, user, password })
const dir = path.join(__dirname, 'sql')
const log = console.log
const error = console.error
const MAIN_FILE = 'main'

/**
 * Start transactions
 * @param sqlList
 * @returns {Promise<void>}
 */
const start = async (sqlList) => {
  try {
    await pool.query('START TRANSACTION;')

    // queries
    for (let i = 0; i < sqlList.length; i++) {
      await pool.query(sqlList[i])
    }

    await pool.query('COMMIT;')
  } catch (e) {
    error(`\x1b[31m✖ ️${e.message}`)
    await pool.query('ROLLBACK;')
  }
}

/**
 * Update version database
 * @param version
 * @param scriptName
 * @returns {Promise<void>}
 */
const setVersion = async (version, scriptName) => {
  await pool.query('INSERT INTO `' + database + '`.`version_control` ' +
    ' (`version`, `script`) VALUES (' + pool.escape(version) + ', ' + pool.escape(scriptName) + ')')
}

/**
 * Parse sql file and return file info
 * @param {String} file
 * @returns {{version : number, name : string}}
 */
const parseFile = (file) => {
  let matches = /v(\d+)__([\w\_]+)\.sql/g.exec(file)
  if (!matches || matches.index < 0) {
    error(`file ['${file}'] has an invalid file name template\nSee help for more information`)
  }

  return {
    version: parseInt(matches[1]),
    script: matches[2],
    name: matches[2].replace(/_/g, ' ')
  }
}

/**
 * Read sql file and return sql statements list
 * @param file
 * @returns {T[]}
 */
const getFileContent = (file) => {
  return fs.readFileSync(path.join(dir, file), 'utf8').split('\n#--\n').filter((r) => r)
}

/**
 * Initialize database structure
 * @returns {Promise<void>}
 */
const initDB = async () => {
  const db = await pool.query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ' + pool.escape(database))

  if (!db.length) {
    let sqlList = getFileContent(`${MAIN_FILE}.sql`) // Note: import main file.

    await start(sqlList)
    await setVersion(1, `${MAIN_FILE}.sql`)
  }

  log('\x1b[32m✔ Initialize database structure.')
}

/**
 * Start process
 */
(async function () {
  try {
    // Note: create database and db structure
    await initDB()

    const result = await pool.query('SELECT MAX(`version`) AS `version` FROM `' + database + '`.`version_control`')
    let version = result.length
      ? parseInt(result[0].version)
      : null

    if (!version) {
      error('Invalid version number. Please, check version_control table!')
      process.exit(1)
    }

    const files = fs.readdirSync(dir).filter((f) => f !== `${MAIN_FILE}.sql`)
    for (let i = 0; i < files.length; i++) {
      const fileInfo = parseFile(files[i])

      if (version < fileInfo.version) {
        let sqlList = getFileContent(files[i])

        await start(sqlList)
        await setVersion(fileInfo.version, fileInfo.script)
      }
    }

    log('\x1b[32m❗ Database updated!')
    process.exit(0)
  } catch (e) {
    error(e)
    process.exit(1)
  }
})()
