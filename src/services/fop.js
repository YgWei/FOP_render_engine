import config from '../config'
import logger from '../logger/system'
import cmd from 'node-cmd'
import Promise from 'bluebird'

const outputFolder = config.folder.outputFolder

export default {
  /**
  * @param {String} srcHtml html來源
  * @param {String} outputFolder 輸出檔案夾
  * @param {String} fileName 輸出檔名
  * @param {Object} option options
  * option={
  *  debug:boolean, //取得更多資訊
  *  javascript:boolean //html讀取時執行javascript
  * }
  */
  async startRender(folder, xml, renderEntry) {
    let fileName = `${xml.split('.')[0]}.pdf`
    const cmdline =
      `cd FOP
      java -jar fopRender.jar -xml ../${folder}/${xml} -xsl ../template/xsl/xsl_yangguang/${renderEntry} -pdf ../${outputFolder}/${fileName}
    `
    logger.info(`[ FOP ] : CMD ${cmdline}`)
    const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd, maxBuffer: 1024 * 1024 * 1024 })

    await getAsync(cmdline).then(data => {
      logger.info('[ FOP ] : Render success')
    }).catch(err => {
      logger.info('[ FOP ] : Render fail ', err)
      throw err
    })
    const array = []
    array.push(fileName)
    array.push(`${fileName}.acc`)
    return array
  }
}
