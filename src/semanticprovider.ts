"use strict";

import * as vscode from "vscode";
import { DocumentCache } from "./cache";
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { TALLexer } from "./talengine/antlr/TALLexer";
import { TALParser } from "./talengine/antlr/TALParser";
import { TALVisitor } from "./talengine/antlr/TALVisitor";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { RuleNode } from "antlr4ts/tree/RuleNode";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ErrorNode } from "antlr4ts/tree/ErrorNode";

/*
export class TALDocumentSemanticTokensProvider
  implements vscode.DocumentSemanticTokensProvider {
  private _cache = new DocumentCache<vscode.SemanticTokens>();
  private parser: TALParser;

  constructor(parser: TALParser) {
    this.parser = parser;
  }

  async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.SemanticTokens> {
    const cached = this._cache.get(document);
    if (cached) {
      return cached[0];
    }

    //const tokens = await this.parser.parse(document);

    //const allTokens = this._parseText(document.getText());
    const builder = new vscode.SemanticTokensBuilder(TALSemanticTokensLegend);
    //allTokens.forEach((token) => {
    //    builder.push(token.line, token.startCharacter, token.length, this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
    //});
    const result = builder.build();

    this._cache.set(document, new Array(result));
    return result;
  }
}
*/

class SemanticTALVisitor implements TALVisitor<void> {
  public visit(tree: ParseTree): void {
    return;
  }

  public visitChildren(node: RuleNode): void {
    console.log("visitChildren");
  }

  public visitTerminal(node: TerminalNode): void {
    console.log("visitTerminal");
  }

  public visitErrorNode(node: ErrorNode): void {
    console.log("visitErrorNode");
  }
}

export class ANTLRTALDocumentSemanticTokensProvider
  implements vscode.DocumentSemanticTokensProvider {
  private _cache = new DocumentCache<vscode.SemanticTokens>();

  async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.SemanticTokens> {

    //const cached = this._cache.get(document);
    //if (cached) {
    //  return cached[0];
    //}
    const stream = CharStreams.fromString(document.getText());
    const lexer = new TALLexer(stream);
    const tokenStream = new CommonTokenStream(lexer);
    //tokenStream.fill();
    //const t = tokenStream.getTokens();
    const v = lexer.vocabulary;
    //console.log("LEXER========================================");
    //t.forEach((i) => {
    //  console.log(v.getSymbolicName(i.type) + " >> `" + i.text + "`");
    //});

    const parser = new TALParser(tokenStream);
    const programContext = parser.program();
    const visitor = new SemanticTALVisitor();
    console.log("PARSER========================================");
    console.log(programContext.toInfoString(parser));
    console.log(programContext.toStringTree());
    console.log(programContext.toString(parser.ruleNames));
    visitor.visit(programContext);
    const builder = new vscode.SemanticTokensBuilder(TALSemanticTokensLegend);
    const result = builder.build();

    //this._cache.set(document, new Array(result));
    return result;
  }
}

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

export const TALSemanticTokensLegend = (function () {
  const tokenTypesLegend = [
    "comment",
    "string",
    "keyword",
    "number",
    "regexp",
    "operator",
    "namespace",
    "type",
    "struct",
    "class",
    "interface",
    "enum",
    "typeParameter",
    "function",
    "member",
    "macro",
    "variable",
    "parameter",
    "property",
    "label",
  ];
  tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

  const tokenModifiersLegend = [
    "declaration",
    "documentation",
    "readonly",
    "static",
    "abstract",
    "deprecated",
    "modification",
    "async",
    "defaultLibrary",
  ];
  tokenModifiersLegend.forEach((tokenModifier, index) =>
    tokenModifiers.set(tokenModifier, index)
  );

  return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();
