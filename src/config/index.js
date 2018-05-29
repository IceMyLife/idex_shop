import yaml from 'yamljs'
import path from 'path'

class Index {
  constructor () {
    this._cfg = yaml.load(path.join(__dirname, '../config', 'config.yml'))
    if (!this._instance) {
      this._instance = {
        ...this._cfg
      }
    }

    return this._instance
  }

  get cfg () {
    return this._cfg
  }

  set cfg (value) {}
}

export default Object.freeze(new Index())
