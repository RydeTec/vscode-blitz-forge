import * as vscode from 'vscode';
import * as bb from '../types';
import { Blitz117Analyzer } from './v117_analyzer';

export interface Analyzer {
    analyze(intext: string, uri: vscode.Uri, parsed: bb.ParseResult): bb.AnalyzeResult;
    getResults(): bb.AnalyzeResult;
}

export function getAnalyzer(bbtext: string, bburi: vscode.Uri, parsed: bb.ParseResult): Analyzer {
    switch(vscode.workspace.getConfiguration('blitzforge.installation').get('SyntaxVersion')) {
        default: return new Blitz117Analyzer(bbtext, bburi, parsed);
    }
}