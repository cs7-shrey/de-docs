import DiffCalculator from "@/lib/diff-calculator-character";
import { Operation } from "@/types";
import { useState } from "react";

interface Options {
	sendChanges: (operations: Operation[], versionId: number) => void;
}

const useDiffCalculator = ({ sendChanges }: Options) => {
	const [diffCalculator] = useState(
		() =>
			new DiffCalculator(
				{
					content: "",
					start: 0,
					end: 0,
				},
				500,
				sendChanges
			)
	);

	return {
		diffCalculator
	};
};

export default useDiffCalculator;
