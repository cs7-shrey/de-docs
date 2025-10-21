import type { State, Operation } from "@/types";
import { diffChars } from "diff";

class DiffCalculator {
	public state: State;
	operations: Operation[];
	timerId?: NodeJS.Timeout;
	delay: number;
	sendChanges: (operations: Operation[], versionId: number) => void;

	constructor(
		state: State,
		delay: number,
		sendChanges: (operations: Operation[], versionId: number) => void,
	) {
		this.state = state;
		this.operations = [];
		this.timerId = undefined;
		this.delay = delay;
		this.sendChanges = sendChanges;
	}

	captureChangeWithDebounce(updatedState: State, versionId: number) {
		clearTimeout(this.timerId);

		// TODO: fast for most use cases, but roll out your own undo stack
		const operations = this.calculateChangeMyers(updatedState);
		if (operations) {
			this.operations = [...this.operations, ...operations];
		}
		this.updateState(updatedState);

		this.timerId = setTimeout(() => {
			this.sendChanges(this.operations, versionId);
			this.operations = [];
		}, this.delay);
	}

	calculateChangeMyers(updatedState: State): Operation[] | undefined {
		const changes = diffChars(this.state.content, updatedState.content);

		let position = 0;
		let count = 0; // local operational transform for operations that are not atomic
		const operations: Operation[] = [];

		for (const change of changes) {
			if (change.added) {
				operations.push({
					type: "insert",
					start: position + count,
					end: position + count,
					inserted: change.value,
				});
				count++;
			} else if (change.removed) {
				operations.push({
					type: "delete",
					start: position + change.value.length + count,
					end: position + change.value.length + count,
					deleted: change.value,
				});
				// count--;

				count -= change.value.length;				// TODO: may need more testing
				position += change.value.length;
			} else {
				position += change.value.length;
			}
		}

		return operations;
	}
	calculateChange(updatedState: State): Operation | undefined {
		// TODO: improve logic here
		if (
			updatedState.start !== updatedState.end &&
			this.state.start === this.state.end
		) {
			// probably an undo of the replace operation
			const deleted = this.state.content.slice(
				updatedState.start,
				this.state.start
			);
			const added = updatedState.content.slice(
				updatedState.start,
				updatedState.end
			);
			return {
				type: "replace",
				inserted: added,
				deleted: deleted,
				start: updatedState.start,
				end: updatedState.end,
			};
		}

		// another possible undo
		// else if(this.state.start !== this.state.end && updatedState.start !== updatedState.end) {
		//     const deleted =
		// }

		// --------------------------------------------------------------------------------------

		// some text was selected
		else if (
			this.state.start !== this.state.end &&
			updatedState.start === updatedState.end
		) {
			const deleted = this.state.content.slice(
				this.state.start,
				this.state.end
			);
			const added = updatedState.content.slice(
				this.state.start,
				updatedState.start
			);

			return {
				type: "replace",
				inserted: added,
				deleted: deleted,
				start: this.state.start,
				end: this.state.end,
			};
		}

		// pure deletion (backspacing)
		if (this.state.content.length > updatedState.content.length) {
			const deleted = this.state.content.slice(
				updatedState.start,
				this.state.start
			);
			return {
				type: "delete",
				deleted: deleted,
				start: this.state.start,
				end: this.state.end,
			};
		}

		// pure insertion
		if (this.state.content.length < updatedState.content.length) {
			const inserted = updatedState.content.slice(
				this.state.start,
				updatedState.start
			);
			return {
				type: "insert",
				inserted: inserted,
				start: this.state.start,
				end: this.state.end,
			};
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
