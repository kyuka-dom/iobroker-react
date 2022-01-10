import { Box } from "@material-ui/core";
import * as React from "react";
// import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import "regenerator-runtime/runtime";

export type ShowSelectId = (
	dialogName: string,
	themeType: string,
	socket: any,
) => void;

export interface SelectIdProps {
	dialogName: string;
	themeType: string;
	socket: any;
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
	return (
		<Box>
			<div>Gugus!!!</div>
		</Box>
	);
};
