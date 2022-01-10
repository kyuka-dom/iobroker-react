import DialogSelectID from "@iobroker/adapter-react/Dialogs/SelectID";
import * as React from "react";
import "regenerator-runtime/runtime";
import { useConnection, useIoBrokerTheme } from "../../hooks";

export type ShowSelectId = (
	dialogName: string,
	selectIdValue: string | string[] | undefined,
	onChange: (value: any) => void,
) => void;

export interface SelectIdProps {
	dialogName: string;
	isOpen: boolean;
	selectIdValue: string | string[] | undefined;
	onChange: (value: any) => void;
	onClose: () => void;
}

export interface SelectIdState {
	isOpen: boolean;
	dialogName: string;
	selectIdValue: string | string[] | undefined;
	onChange: (value: any) => void;
}

export const SelectId: React.FC<SelectIdProps> = (props) => {
	console.log("RUNNING SELECTIDDIALOG", props);

	const [themeName, setTheme] = useIoBrokerTheme();
	const connection: any = useConnection();

	function handleClose() {
		props.onClose();
	}

	if (!props.isOpen) return null;
	return (
		<DialogSelectID
			key="tableSelect"
			imagePrefix="../.."
			dialogName={props.dialogName}
			themeType={themeName}
			socket={connection}
			statesOnly={true}
			selected={props.selectIdValue}
			onClose={handleClose}
			onOk={(selected: string | string[] | undefined) => {
				/*setState({ showSelectId: false });
				this.props.onChange(selected);
				this.selectIdValue = selected;*/
				console.log("onOk", selected);
				props.onChange(selected);
			}}
		/>
	);
};
