"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const document_1 = require("./document");
const yamljs = require('yamljs');
const clipboardy = require('clipboardy');
const unescape = require('lodash.unescape');
const DOCUMENT_ERROR = 'Selection or document is invalid YAML or JSON???';
const CLIPBOARD_ERROR = 'Clipboard is invalid YAML or JSON???';
class Command {
    static convertDocument() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.selection && activeEditor.selection.active) {
            activeEditor.edit(editor => {
                const select = activeEditor.document.getText(activeEditor.selection);
                let input = select || activeEditor.document.getText();
                const callback = (err, result) => {
                    if (err || !result) {
                        vscode.window.showErrorMessage(DOCUMENT_ERROR);
                    }
                    else {
                        if (select) {
                            document_1.Document.replaceSelection(editor, activeEditor.selection, result);
                        }
                        else {
                            document_1.Document.replaceDocument(editor, activeEditor.document, result);
                        }
                    }
                };
                this._convert(input, callback);
            });
        }
    }
    static convertClipboard() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.selection && activeEditor.selection.active) {
            activeEditor.edit(editor => {
                const select = activeEditor.document.getText(activeEditor.selection);
                let input = clipboardy.readSync();
                const callback = (err, result) => {
                    if (err || !result) {
                        vscode.window.showErrorMessage(CLIPBOARD_ERROR);
                    }
                    else {
                        if (select) {
                            document_1.Document.replaceSelection(editor, activeEditor.selection, result);
                        }
                        else {
                            document_1.Document.insert(editor, activeEditor.selection, result);
                        }
                    }
                };
                this._convert(input, callback);
            });
        }
    }
    static _convert(input, callback) {
        input = unescape(input);
        try {
            // Assume a successful JSON parse means we're converting JSON->YAML
            const json = JSON.parse(input);
            // Second parameter controls depth before inlining structures
            const yaml = yamljs.stringify(json, 6, vscode.workspace.getConfiguration('editor').get('tabSize', 4));
            callback(null, yaml);
        }
        // Otherwise, YAML->JSON?
        catch (_a) {
            try {
                const js = yamljs.parse(input);
                callback(null, JSON.stringify(js, null, 2));
            }
            catch (e) {
                callback(e);
            }
        }
    }
}
exports.Command = Command;
//# sourceMappingURL=command.js.map