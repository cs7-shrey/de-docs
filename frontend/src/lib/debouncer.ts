class Debouncer {
    private timeoutId: ReturnType<typeof setTimeout> | null = null;
    private delay: number;

    constructor(delay: number) {
        this.delay = delay;
    }

    debounce(func: () => void) {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            func();
        }, this.delay);
    }
}

export default Debouncer;