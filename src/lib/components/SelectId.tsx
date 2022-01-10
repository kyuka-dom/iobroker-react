import type {
	ObjectBrowserColumn,
	ObjectBrowserType,
} from "@iobroker/adapter-react/Components/types";
import DialogSelectID from "@iobroker/adapter-react/Dialogs/SelectID";
import * as React from "react";
import "regenerator-runtime/runtime";
import { useConnection, useIoBrokerTheme } from "../../hooks";

export type ShowSelectId = (
	dialogName: string,
	selectIdValue: string | string[] | undefined,
	onChange: (value: any) => void,
	title?: string,
	multiSelect?: boolean,
	columns?: ObjectBrowserColumn[],
	types?: ObjectBrowserType[],
) => void;

export interface SelectIdProps {
	dialogName: string;
	isOpen: boolean;
	selectIdValue: string | string[] | undefined;
	onChange: (value: any) => void;
	onClose: () => void;
	title?: string;
	multiSelect?: boolean;
	columns?: ObjectBrowserColumn[];
	types?: ObjectBrowserType[];
}

export interface SelectIdState {
	isOpen: boolean;
	dialogName: string;
	selectIdValue: string | string[] | undefined;
	onChange: (value: any) => void;
	title?: string;
	multiSelect?: boolean;
	columns?: ObjectBrowserColumn[];
	types?: ObjectBrowserType[];
}

export const SelectId: React.FC<SelectIdProps> = (props) => {
	// console.log("RUNNING SELECTIDDIALOG", props);

	const [themeName, setTheme] = useIoBrokerTheme();
	const connection: any = useConnection();

	function handleClose() {
		props.onClose();
	}

	if (!props.isOpen) return null;
	return (
		<DialogSelectID
			key="tableSelect"
			title={props.title}
			multiSelect={props.multiSelect}
			imagePrefix="../.."
			dialogName={props.dialogName}
			themeName={themeName}
			socket={connection}
			statesOnly={true}
			selected={props.selectIdValue}
			onClose={handleClose}
			onOk={(selected: string | string[] | undefined) => {
				props.onChange(selected);
			}}
		/>
	);
};
