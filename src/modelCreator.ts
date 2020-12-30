"use strict";

import { window, workspace, EndOfLine } from "vscode";

function upperFirstCase(str: string) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

const defaultTypeValue = {
  'number': void 0,
  'undefined': void 0,
  'string': '',
  'boolean': false,
  'bigint': void 0,
  'symbol': void 0,
  'object': {},
  'function': void 0,
}

export class ModelCreator {
  public data: { [key: string]: any } = {};
  private className = "Test";
  private enterSign = "\n";
  private modelStr: Array<string> = [];

  constructor(className: string, dataJson: {[key: string]: any}) {
    if (window.activeTextEditor?.document.eol) {
      this.enterSign =
        window.activeTextEditor?.document.eol === EndOfLine.LF ? "\n" : "\r\n";
    }

    this.className = className ? upperFirstCase(className) : this.className;
    this.data = dataJson || {};
  }

  /**
   * 创建model
   */
  public generateModel() {
    // 先判断 this.data 有没有值
    if (this.data !== null) {
      // 构建接口 model constructor
      this.modelStr.push(this.generateConstructor(this.data));
      this.modelStr.push(this.generateInterface(this.data));
      this.modelStr.push(this.generateClass(this.className, this.data["data"] || {}));
      // this.modelStr.push(this.generateClass(this.className, this.data || {}));
      return this.modelStr.reverse().join(this.enterSign);
    } else {
      window.showErrorMessage("data 值为null，请重新复制接口响应数据");
      return "";
    }
  }

  /** 创建 接口定义 */
  private generateInterface(data: { [key: string]: any }) {
    let tempInterArr = [];
    tempInterArr.push(`interface I${this.className}ContainerModel<T> {`);
    Object.keys(data).forEach(key => {
      if (key !== "data") {
        if (typeof data[key] !== 'object') {
          tempInterArr.push(`  ${key}: ${typeof data[key]};`);
        } else if (data[key] === null) {
          tempInterArr.push(`  ${key}: null;`);
        }
      }
    });
    tempInterArr.push(`  data: T;`);
    tempInterArr.push(`}${this.enterSign}`);
    return tempInterArr.join(this.enterSign);
  }

  /**
   * 创建 数据的 constructor
   * @param data 接口数据
   */
  private generateConstructor(data: { [key: string]: any }) {
    let tempConArr = [];
    const baseStructureKey = ['msg', 'message', 'ok', 'success', 'status', 'code', 'data']
    if (Array.isArray(data["data"])) {
      tempConArr.push(
        `export class ${this.className}CM extends ContainerModel<${this.className}M[]>{`
      );
    } else {
      tempConArr.push(
        `export class ${this.className}CM extends ContainerModel<${this.className}M>{`
      );
    }
    // 创建 额外的响应结构（1）
    tempConArr.push(`    // 额外的响应结构`);
    Object.keys(data).filter(key => baseStructureKey.indexOf(key) === -1).forEach(key => {
      // 创建 额外的响应结构（2）
      if (typeof data[key] !== 'object') {
        tempConArr.push(`    ${key}:${typeof data[key]} = ${defaultTypeValue[typeof data[key]]};`);
      } else if (data[key] === null) {
        tempConArr.push(`    ${key} = null;`);
      } else if (Array.isArray(data[key])) {
        tempConArr.push(`    ${key} = [];`);
      } else {
        tempConArr.push(`    ${key} = {};`);
      }
    });

    tempConArr.push('');
    if (Array.isArray(data["data"])) {
      tempConArr.push(
        `    constructor(props: I${this.className}ContainerModel<${this.className}M[]>){`
      );
    } else {
      tempConArr.push(
        `    constructor(props: I${this.className}ContainerModel<${this.className}M>){`
      );
    }
    tempConArr.push(`        super(props);`);
    tempConArr.push('');

    // 创建 基本响应结构 msg,code,status
    tempConArr.push(`        // 基本响应结构`);
    Object.keys(data).forEach(key => {
      if (key === "msg" || key === "message") {
        tempConArr.push(`        this.message = props.${key} || '查询成功';`);
      }
      if (key === "ok" || key === "success") {
        tempConArr.push(`        this.success = props.${key} || true;`);
      }
      if (key === "status" || key === "code") {
        tempConArr.push(`        this.code = props.${key} || '';`);
        tempConArr.push('');
      }

      // 创建 额外的响应结构（2）
      if (baseStructureKey.indexOf(key) === -1) {
        if (typeof data[key] !== 'object') {
          tempConArr.push(`        this.${key} = props.${key} || ${defaultTypeValue[typeof data[key]]};`);
        } else if (data[key] === null) {
          tempConArr.push(`        this.${key} = props.${key} || null;`);
        } else if (Array.isArray(data[key])) {
          tempConArr.push(`        this.${key} = props.${key} || [];`);
        } else {
          tempConArr.push(`        this.${key} = props.${key} || {};`);
        }
      }
    });
    tempConArr.push('');
    // 创建 data
    tempConArr.push(`        if (props && props.data) {`);
    if (Array.isArray(data["data"])) {
      tempConArr.push(
        `            this.data = super.transformArray(props.data, ${this.className}M);`
      );
    } else {
      tempConArr.push(
        `            this.data = super.transformRow(props.data, ${this.className}M);`
      );
    }
    tempConArr.push(`        } else {`);
    if (Array.isArray(data["data"])) {
      tempConArr.push(`            this.data = []`);
    } else {
      tempConArr.push(`            this.data = new ${this.className}M()`);
    }
    tempConArr.push(`        }`);
    tempConArr.push(`   }`);
    tempConArr.push(`}`);
    tempConArr.push('');
    return tempConArr.join(this.enterSign);
  }

  /**
   * 创建实体
   * @param name 实体名称
   * @param data 实体数据
   */
  private generateClass(name: string, data: { [key: string]: any }) {
    let _genClass = (data: {[key: string]: any}) => {
      Object.keys(data).forEach(key => {
        if (typeof data[key] === "number") {
          tempClassArr.push(`    @DataMapper('${key}')`);
          tempClassArr.push(`    ${key}:number | undefined = void 0;`);
          tempClassArr.push('');
        }
        if (typeof data[key] === "string") {
          tempClassArr.push(`    @DataMapper('${key}')`);
          tempClassArr.push(`    ${key} = '';`);
          tempClassArr.push('');
        }
        if (typeof data[key] === "boolean") {
          tempClassArr.push(`    @DataMapper('${key}')`);
          tempClassArr.push(`    ${key} = false;`);
          tempClassArr.push('');
        }
        if (typeof data[key] === "undefined") {
          tempClassArr.push(`    @DataMapper('${key}')`);
          tempClassArr.push(`    ${key} = void 0;`);
          tempClassArr.push('');
        }
        if (typeof data[key] === "object") {
          if (data[key] === null) {
            tempClassArr.push(`    @DataMapper('${key}')`);
            tempClassArr.push(`    ${key} = null;`);
          tempClassArr.push('');
          } else if (Array.isArray(data[key])) {
            tempClassArr.push(`    @DataMapper('${key}')`);
            tempClassArr.push(`    ${key}:${upperFirstCase(key)}M[] = [];`);
          tempClassArr.push('');
            tempClassArr.unshift(this.generateClass(upperFirstCase(key), data[key][0]))
          } else {
            tempClassArr.push(
              `    @DataMapper({ clazz: ${key}M, name: '${key}' })`
            );
            tempClassArr.push(`    ${key} = new ${upperFirstCase(key)}M;`);
          tempClassArr.push('');
            tempClassArr.unshift(this.generateClass(upperFirstCase(key), data[key]))
          }
        }
      });
    }
    let tempClassArr = [];
    tempClassArr.push(`export class ${name}M {`);
    if (Array.isArray(data)) {
      _genClass(data[0])
    } else {
      _genClass(data)
    }
    tempClassArr.push(`}`);
    tempClassArr.push('');
    return tempClassArr.join(this.enterSign);
  }
}