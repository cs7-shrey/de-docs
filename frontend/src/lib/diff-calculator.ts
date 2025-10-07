import type { State } from "@/types";
class DiffCalculator {
    prevState: State | undefined;
    currentState: State | undefined;
    timerId: NodeJS.Timeout | undefined;
    delay: number;

    constructor(delay: number) {
        this.prevState = undefined;
        this.currentState = undefined;
        this.timerId = undefined;
        this.delay = delay;
    }

    diffCalculator (prevState: State, currentState: State) {
        const addedContent = this.calculateAddedContent(prevState, currentState);
        const deletedContent = this.calculateDeletedContent(prevState, currentState);

        console.log("+++", addedContent);
        console.log("---", deletedContent);
    }

    calculateAddedContent(prevState: State, currentState: State) {
        const startToEnd = currentState.content.slice(currentState.start, currentState.end);
        if(prevState.start === currentState.start) {
            return startToEnd;
        }
        return currentState.content.slice(prevState.start, currentState.start) + startToEnd;
    }
    
    calculateDeletedContent(prevState: State, currentState: State) {
        const selectedDelete = prevState.content.slice(prevState.start, prevState.end);

        if(prevState.start === currentState.start) {
            return selectedDelete;
        }

        return prevState.content.slice(currentState.start, prevState.start) + selectedDelete;
    }

    calculateWithDebounce(prevState: State, currentState: State) {
        if(!this.prevState) {
            this.prevState = prevState;
        }

        clearTimeout(this.timerId);
        this.currentState = currentState;

        this.timerId = setTimeout(() => {
            this.diffCalculator(this.prevState!, this.currentState!);
            this.prevState = undefined;
            this.currentState = undefined;
        }, this.delay)
    }
}

export default DiffCalculator;