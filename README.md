# HLSnippets

<p align="center">
  <img width="300" src="https://raw.githubusercontent.com/kunkuntang/HL_VSCode_Snippets/develop/images/HLS-icon.png" />
</p>

Using this extensions, you can generate all kinds of template code. Hope you like it!

[English Document](https://github.com/kunkuntang/HL_VSCode_Snippets/blob/master/README.md) | [中文文档](https://github.com/kunkuntang/HL_VSCode_Snippets/blob/master/README_CN.md)

## Features

- support create data model from service interface;
- fix HLComponentTable Snippets placeholder;
- add QueryCondition snippet;
- move the other snippet from HLContainerSnippets.json to HLSnippets.json
- add checkbox group formItem and radio group formItem
- add submitAutoMessage snippet

## Installation
Install through VS Code extensions. Search for HLSnippets

[Visual Studio Code Market Place: HLSnippets](https://marketplace.visualstudio.com/items?itemName=kuntang.hlsnippets)

## Usage

These extends includes three types of snippets:

- Container Snippets, create page template code in blank file.
- Component Snippets, create component template code in a page.
- Creator(Create) Snippets, create some special template code in all kinds of file, like store, service, etc.

According these snippets categories, `HLSnippets` defined the snippet instruction with `prefix` + `scope` + `type`.

### Simple Example

When I want to write a new page, I will create jsx file in the workspace and open the file. Then write `HLContainerPage` and tab the tips, so the page template code will show on the file.

<p align="center">
  <img width="1440" src="https://raw.githubusercontent.com/kunkuntang/HL_VSCode_Snippets/develop/images/HLSinppets-intro.gif" />
</p>

Let's learn the instruction rule by this example, as we just done before, we create a file and tag a instruction named `HLContainerPage`. The `Prefix` of this instruction here is `HL`, and all the `Prefix` call `HL` permanent. And go on we see the `Scope` called `Container`, byt the way, other two `Scopes` is `Component` and `Create`. Final part of the instruction is `Type`, which the specific function you want to do. The `type` of `HLContainerPage` is `Page` means you will generate the page template code in the file.

### All Snippets List

The table below list all the snippets and instruction.

#### Container Snippets:

Snippets Name | Instruction
---|---
HLContainerPage | generate **page** template code
HLContainerFormConfig | generate **form** config template code
HLContainerTableColumns | generate **table** Columns template code
HLContainerFormField | generate **formField** template code
HLContainerQueryConditionsConfig | generate **QueryCondition** config template code
HLContainerStore | generate **observable store** template code

#### Component Snippets

Snippets Name | Instruction
---|---
HLComponentForm | generate **form** template code
HLComponentModal | generate **modal** template code
HLComponentQRCoe | generate **QRCode** template code
HLComponentTable | generate **table** template code
HLComponentSelectTable | generate **selectable** template code
HLComponentQueryConditions | generate **QueryConditions** template code
HLComponentBaiduMap | generate **BaiduMap** template code
HLComponentPrint | generate **Print** template code

#### Creator Snippets

Service Creator Snippets:

Snippets Name | Instruction
---|---
HLCreateGetService | generate **get service** template code
HLCreatePostService | generate **post service** template code

Table Creator Snippets:

Snippets Name | Instruction
---|---
HLCreateTableColumnsItem | generate **table columns item** template code

Form Field Creator Snippets:

Snippets Name | Instruction
---|---
HLCreateFormFieldRule | generate **form field rule** template code
HLCreateFormFieldExtendRule | generate **form field extend rule** template code
HLCreateTextFormField | generate **text form field** template code
HLCreateInputFormField | generate **input form field** template code
HLCreateSwitchFormField | generate **switch form field** template code
HLCreateNumberInputFormField | generate **numberInput form field** template code
HLCreateMultipleSelectFormField | generate **multipleSelect form field** template code
HLCreateSelectPageFormField | generate **selectPage form field** template code
HLCreateDatePickerFormField | generate **datePicker form field** template code
HLCreateUploadFormField | generate **uploadForm form field** template code
HLCreateHiddenFormField | generate **hidden form field** template code
HLCreateExtraFormField | generate **extra form field** template code
HLCreateCustomFormField | generate **custom form field** template code

> **Hidden Form Field:** means the formField that don't show in the UI but needed to send to the backend interface.

> **Extra Form Field:** means the formField that show in the UI but not necessary to send the backend interface.

> **Custom Form Field:** means maximum custom property show in the template code, like `regex`, `validator`, etc.

Form Item Creator Snippets:

Snippets Name | Instruction
---|---
HLCreateInputFormItem | generate **text form item** template code
HLCreateNumberInputFormItem | generate **numberInput form item** template code
HLCreateTextAreaFormItem | generate **textarea form item** template code
HLCreateRadioButtonFormItem | generate **radio button form item** template code
HLCreateSwitchFormItem | generate **switch form item** template code
HLCreateDatePickerFormItem | generate **datePicker form item** template code
HLCreateSelectFormItem | generate **select form item** template code
HLCreateSearchSelectFormItem | generate **searchSelect form item** template code
HLCreateUploadFormItem | generate **upload form item** template code
HLCreateCustomFormItem | generate **custom form item** template code

QueryCondition Creator Snippet

Snippets Name | Instruction
---|---
HLCreateQCInputConfig | generate **input queryCondition item** template code
HLCreateQCInputNumberConfig | generate **input number queryCondition item** template code
HLCreateQCTextAreaConfig | generate **textArea queryCondition item** template code
HLCreateQCSelectConfig | generate **select queryCondition item** template code
HLCreateQCRadioButtonConfig | generate **radio button queryCondition item** template code
HLCreateQCCheckBoxConfig | generate **checkBox queryCondition item** template code
HLCreateQCDateConfig | generate **date queryCondition item** template code
HLCreateQCDatePickerConfig | generate **date picker queryCondition item** template code

## Generate Model Code

<p align="center">
  <img width="1440" src="https://raw.githubusercontent.com/kunkuntang/HL_VSCode_Snippets/master/images/create-model.gif" />
</p>

First copy the JSON data from the service interface, and press F1 or Ctrl + Shift + P trigger the command panel of VsCode, then enter the `HL Create Model` instruction and input the model name(default use the text of the current selection in the active editor of VsCode), finally you will see the code generated at the file.

> if the model name is hard to text you can copy that model name and paste in the file, then select the name and continue trigger the `HL Create Model` instruction.

> You can use the `REST Client` VsCode plugin help you to get the response JSON string from the backend interface.

## Requirements

Visual Studio Code version is above `^1.34.0`.

## Release Notes

This is the first publishing of HLSnippets.

### 0.0.1

Add code snippets.

-----------------------------------------------------------------------------------------------------------

**Enjoy!**
