import * as vscode from 'vscode';
import * as bb from '../types';
import { Blitz117Parser } from './v117_parser';

export interface Parser {
    parse(intext: string, uri: vscode.Uri): bb.ParseResult;
    getResults(): bb.ParseResult;
}

export function getParser(bbtext: string, bburi: vscode.Uri): Parser {
    switch (vscode.workspace.getConfiguration('blitzforge.installation').get('SyntaxVersion')) {
        default: return new Blitz117Parser(bbtext, bburi);
    }
}