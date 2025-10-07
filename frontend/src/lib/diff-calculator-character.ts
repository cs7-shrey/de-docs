import type { State, Operation } from "@/types";
import axiosInstance from "./api-client";

class DiffCalculator {
    state: State;
    operations: Operation[];
    timerId?: NodeJS.Timeout;
    delay: number;
    setVersionId: (version: number) => void;
    sessionId: string;

    constructor(state: State, delay: number, setVersionId: (version: number) => void, sessionId: string) {
        this.state = state;
        this.operations = [];
        this.timerId = undefined;
        this.delay = delay;
        this.setVersionId = setVersionId;
        this.sessionId = sessionId;
    }

    captureChangeWithDebounce(updatedState: State, versionId: number) {
        clearTimeout(this.timerId);

        // const operation = this.calculateChange(updatedState);
        // if(operation) {
        //     this.operations.push(operation);
        // }

        // TODO: fast for most use cases, but roll out your own undo stack
        const operations = this.calculateChangeMyers(updatedState);
        if(operations) {
            this.operations = [...this.operations, ...operations];
        }
        this.updateState(updatedState);

        this.timerId = setTimeout(() => {
            this.sendChanges(versionId);
            this.operations = [];
        }, this.delay);
    }

    async sendChanges(versionId: number) {
        const response = await axiosInstance.post('/changes', {
            operations: this.operations,
            docVersionId: versionId,
            sessionId: this.sessionId
        })
        this.setVersionId(response.data.versionId);
        console.log(this.operations);
    }

    calculateChangeMyers(updatedState: State): Operation[] | undefined {
        const changes = diffChars(this.state.content, updatedState.content);
    
        let position = 0;
        const operations: Operation[] = [];
        
        for (const change of changes) {
            if (change.added) {
                operations.push({
                    type: 'insert',
                    start: position,
                    end: position,
                    inserted: change.value
                });
            } else if (change.removed) {
                operations.push({
                    type: 'delete',
                    start: position + change.value.length,
                    end: position + change.value.length,
                    deleted: change.value
                });
                position += change.value.length;
            } else {
                position += change.value.length;
            }
        }
        
        return operations;
    }
    calculateChange(updatedState: State): Operation | undefined {
        // TODO: improve logic here
        if(updatedState.start !== updatedState.end && this.state.start === this.state.end) {
            // probably an undo of the replace operation
            const deleted = this.state.content.slice(updatedState.start, this.state.start);
            const added = updatedState.content.slice(updatedState.start, updatedState.end);
            return {
                type: 'replace',
                inserted: added,
                deleted: deleted,
                start: updatedState.start,
                end: updatedState.end
            }
        }

        // another possible undo
        // else if(this.state.start !== this.state.end && updatedState.start !== updatedState.end) {
        //     const deleted = 
        // }


        // --------------------------------------------------------------------------------------

        // some text was selected
        else if (this.state.start !== this.state.end && updatedState.start === updatedState.end) {
            const deleted = this.state.content.slice(this.state.start, this.state.end);
            const added = updatedState.content.slice(this.state.start, updatedState.start);

            return {
                type: 'replace',
                inserted: added,
                deleted: deleted,
                start: this.state.start,
                end: this.state.end
            }
        }

        // pure deletion (backspacing)
        if (this.state.content.length > updatedState.content.length) {
            const deleted = this.state.content.slice(updatedState.start, this.state.start);
            return {
                type: 'delete',
                deleted: deleted,
                start: this.state.start,
                end: this.state.end
            }
        }

        // pure insertion
        if (this.state.content.length < updatedState.content.length) {
            const inserted = updatedState.content.slice(this.state.start, updatedState.start);
            return {
                type: 'insert',
                inserted: inserted,
                start: this.state.start,
                end: this.state.end
            }
        }
    }

    updateState(updatedState: State) {
        this.state = updatedState;
    }

    updateCursor(start: number, end: number) {
        this.state.start = start;
        this.state.end = end;
    }
}

export default DiffCalculator;

import { diffChars } from "diff";
import { Oregano } from "next/font/google";

const c1 = "hey there";
const c2 = "hey hello";

const changes = diffChars(c1, c2);

console.log(JSON.stringify(changes));