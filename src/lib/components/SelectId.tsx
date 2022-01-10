import DialogSelectID from "@iobroker/adapter-react/Dialogs/SelectID";
import * as React from "react";
import "regenerator-runtime/runtime";

export type ShowSelectId = (
	dialogName: string,
	themeType: string,
	connection: any,
) => void;

export interface SelectIdProps {
	dialogName: string;
	isOpen: boolean;
	themeType: string;
	connection: any;
	selectIdValue?: string | string[] | undefined;
	onChange?: (value: any) => void;
	onClose: () => void;
}

export interface SelectIdState {
	isOpen: boolean;
	dialogName: string;
	themeType: string;
	connection: any;
}

export const SelectId: React.FC<SelectIdProps> = (props) => {
	console.log("RUNNING SELECTIDDIALOG", props);

	function handleClose() {
		props.onClose();
	}

	if (!props.isOpen) return null;
	return (
		<DialogSelectID
			key="tableSelect"
			imagePrefix="../.."
			dialogName={props.dialogName}
			themeType={props.themeType}
			socket={props.connection}
			statesOnly={true}
			selected={props.selectIdValue}
			onClose={handleClose}
			onOk={(selected: string | string[] | undefined) => {
				/*setState({ showSelectId: false });
				this.props.onChange(selected);
				this.selectIdValue = selected;*/
				console.log("onOk", selected);
			}}
		/>
	);
};
