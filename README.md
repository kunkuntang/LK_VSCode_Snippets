# LKSnippets

<p align="center">
  <img width="300" src="https://raw.githubusercontent.com/kunkuntang/LK_VSCode_Snippets/master/images/LKS-icon.png" />
</p>

Using this extensions, you can generate all kinds of template code. Hope you like it!

## Features

- 支持自动生成 Modal 层
- 支持表格、表格项脚本生成
- 支持表单、表单项脚本生成
- 支持页面文件脚本生成
- 支持 store 文件脚本生成

## 安装
通过 vscode 的插件市场安装： 搜索 LK_VSCode_Snippets

[Visual Studio Code Market Place: LKSnippets](https://marketplace.visualstudio.com/items?itemName=kuntang.LKsnippets)

## 使用方法

这个插件提供三种类型的脚本：

- 文件脚本，生成当你创建一个文件时要写的代码
- 组件脚本，生成你想要写的组件的代码
- 碎片脚本，生成一些零碎的代码片段，如请求接口代码等

根据脚本的分类，`LKSnippets` 把脚本指令拆开了三部分：`prefix` + `scope` + `type`。用下面一个简单示例来讲解：

当开发者想要新建一个页面时会进行一下步骤：

1. 新建一个 jsx 后缀的页面文件
2. 然后输入 `LKContainerPage` 指令并按回车生成代码
3. 开发者继续进行业务开发

<p align="center">
  <img width="1440" src="https://raw.githubusercontent.com/kunkuntang/LK_VSCode_Snippets/develop/images/LKSinppets-intro.gif" />
</p>

现在解释一下指令的三部分：

- `prefix`： 前缀，固定是 `LK` 开头的，以免和其他插件的指令混淆。
- `scope`： 作用域，就是三种类型的脚本，分别是 `Container` —— 文件脚本，`Component` —— 组件脚本， `Create` —— 碎片脚本
- `type`： 脚本类型，就是指改作用域下的脚本类型，比如 `Container` 下的 `Page` 就是生成新页面文件的模板代码，`Container` 下的 `Store` 则是生成新Store文件的模板代码


### 所有的脚本列表

下面的表格展示了所有类型的脚本和简单的使用说明

#### Container Snippets:

Snippets Name | Instruction
---|---
LKContainerPage | 生成 **页面** 模板代码
LKContainerFormConfig | 生成 **表单** 配置项 模板代码
LKContainerTableColumns | 生成 **表格** 配置项 模板代码
LKContainerStore | 生成 **store** 模板代码

#### Component Snippets

Snippets Name | Instruction
---|---
LKComponentForm | 生成 **表单** 模板代码
LKComponentModal | 生成 **模态框** 模板代码
<!-- LKComponentQRCoe | 生成 **QRCode** 模板代码 -->
LKComponentTable | 生成 **表格** 模板代码
LKComponentMap | 生成 **地图** 模板代码

#### Creator Snippets

接口的代码模板 Creator Snippets:

Snippets Name | Instruction
---|---
LKCreateGetService | 生成 **get 接口** 模板代码
LKCreatePostService | 生成 **post 接口** 模板代码
LKCreatePutService | 生成 **put 接口** 模板代码
LKCreateDeleteService | 生成 **delete 接口** 模板代码
LKCreatePatchService | 生成 **patch 接口** 模板代码
LKCreateUpdateService | 生成 **update 接口** 模板代码

表格脚本:

Snippets Name | Instruction
---|---
LKCreateTableColumnsConfig | 生成 **表格配置项** 模板代码
LKCreateTableCustomColumnsConfig | 生成 **自定义表格配置项** 模板代码

表单项脚本:

Snippets Name | Instruction
---|---
LKCreateInputFormField | 生成 **输入框表单项** 模板代码
LKCreateSwitchFormField | 生成 **开关表单项** 模板代码
LKCreateInputNumberFormField | 生成 **数字输入框表单项** 模板代码
LKCreateSelectFormField | 生成 **下拉表单项** 模板代码
LKCreateDatePickerFormField | 生成 **日期表单项** 模板代码
LKCreateRadioGroupFormField | 生成 **单选表单项** 模板代码
LKCreateCheckboxGroupFormField | 生成 **多选表单项** 模板代码
LKCreateTextAreaFormField | 生成 **多行文本表单项** 模板代码
LKCreateTimePickerFormField | 生成 **时间选择器表单项** 模板代码
LKCreateCascaderFormField | 生成 **多级下拉表单项** 模板代码

## Generate Model Code

<p align="center">
  <img width="1440" src="https://raw.githubusercontent.com/kunkuntang/LK_VSCode_Snippets/master/images/create-model.gif" />
</p>

首先拷贝一个接口的 JOSN 数据，按 F1 或者 Ctrl + Shift + P 调出控制面板，输入 `LK Create Model` 命令，然后输入想要生成的 model 名称，最后按回车后就可以生成出 model 的代码。


> 如果觉得输入的 model 的名称太长，可以先把 model 的名称复制到文件中，然后选中这个单词（在执行 `LK Create Model` 指令的的时候会默认填充选中的文本），再进行生成 model 操作。

> 可以使用 REST Client 插件来帮助你快速复制接口返回的 JSON 数据。

## Requirements

Visual Studio Code version is above `^1.34.0`.

## Release Notes

This is the first publishing of LKSnippets.

### 0.0.1

Add code snippets.

-----------------------------------------------------------------------------------------------------------

**Enjoy!**
