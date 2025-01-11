import * as vscode from 'vscode';
import * as cp from 'child_process';
import { blitzCmd, blitzpath } from '../context/context';

let treekill: any;
try {
    treekill = require('tree-kill');
} catch (e) {
    console.warn('tree-kill not available, falling back to process.kill');
    treekill = (pid: number) => process.kill(pid);
}

export default class DebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new BlitzDebugSession());
    }
}

class BlitzDebugSession implements vscode.DebugAdapter {
    private debugProcess?: cp.ChildProcess;
    private readonly messageEmitter = new vscode.EventEmitter<any>();
    onDidSendMessage: vscode.Event<any> = this.messageEmitter.event;

    dispose() {
        if (this.debugProcess) {
            this.debugProcess.kill();
        }
        this.messageEmitter.dispose();
    }

    handleMessage(message: any): void {
        if (message.type === 'request' && message.command === 'launch') {
            this.launch(message);
        } else if (message.type === 'request' && message.command === 'disconnect') {
            this.disconnect();
        }
    }

    private launch(message: any): void {
        const args = message.arguments;
        const cmd = `${blitzCmd} ${args.noDebug ? ' ' : ' -d '} "${args.bbfile}"`;
        const env = { ...process.env };
        if (blitzpath) env['BLITZPATH'] = blitzpath;

        this.debugProcess = cp.exec(cmd, { env });
        
        this.debugProcess.on('exit', code => {
            this.sendEvent('terminated');
        });

        this.debugProcess.stdout?.on('data', data => {
            this.sendEvent('output', { category: 'stdout', output: data.toString() });
        });

        this.debugProcess.stderr?.on('data', data => {
            this.sendEvent('output', { category: 'stderr', output: data.toString() });
        });
    }

    private disconnect(): void {
        if (this.debugProcess?.pid) {
            treekill(this.debugProcess.pid);
        }
        this.dispose();
    }

    private sendEvent(event: string, body?: any): void {
        const response = {
            type: 'event',
            event,
            body
        };
        this.messageEmitter.fire(response);
    }
}