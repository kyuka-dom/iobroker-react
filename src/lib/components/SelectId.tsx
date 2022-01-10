import type {
	ObjectBrowserColumn,
	ObjectBrowserType,
} from "@iobroker/adapter-react/Components/types";
import * as React from "react";

import ObjectBrowser from "@iobroker/adapter-react/Components/ObjectBrowser";
import Utils from "@iobroker/adapter-react/Components/Utils";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import withStyles from "@material-ui/core/styles/withStyles";
import IconCancel from "@material-ui/icons/Cancel";
import IconOk from "@material-ui/icons/Check";

import "regenerator-runtime/runtime";
import { useConnection, useI18n, useIoBrokerTheme } from "../../hooks";
import DialogSelectID from "../Dialogs/SelectID";
import { useCallback, useEffect, useRef, useState } from "react";

export type ShowSelectId = (
	dialogName: string, // where to store settings in localStorage
	classes: object,
	onClose: () => void,
	onOk: (value: any) => void,
	selected: string | string[] | undefined,
	notEditable?: boolean,
	title?: string,
	lang?: string,
	multiSelect?: boolean,
	types?: string[], // optional ['state', 'instance', 'channel']
	columns?: string[], // optional ['name', 'type', 'role', 'room', 'func', 'val', 'buttons']
	foldersFirst?: boolean,
	customFilter?: any, // optional {common: {custom: true}} or {common: {custom: 'sql.0'}}
	statesOnly?: boolean,
	cancel?: string,
	imagePrefix?: string,
	ok?: string,
	themeType?: string,
	showExpertButton?: boolean,
	filterFunc?: any, // function to filter out all unneccessary objects. It cannot be used together with "types"
) => void;

export interface SelectIdProps {
	isOpen: boolean;
	dialogName: string; // where to store settings in localStorage
	classes: object;
	onClose: () => void;
	onOk: (value: any) => void;
	selected: string | string[] | undefined;
	notEditable?: boolean;
	title?: string;
	lang?: string;
	multiSelect?: boolean;
	types?: string[]; // optional ['state', 'instance', 'channel']
	columns?: string[]; // optional ['name', 'type', 'role', 'room', 'func', 'val', 'buttons']
	foldersFirst?: boolean;
	customFilter?: any; // optional {common: {custom: true}} or {common: {custom: 'sql.0'}}
	statesOnly?: boolean;
	cancel?: string;
	imagePrefix?: string;
	ok?: string;
	themeType?: string;
	showExpertButton?: boolean;
	filterFunc?: any; // function to filter out all unneccessary objects. It cannot be used together with "types"
}

export interface SelectIdState {
	isOpen: boolean;
	dialogName: string; // where to store settings in localStorage
	classes: object;
	onClose: () => void;
	onOk: (value: any) => void;
	selected: string | string[] | undefined;
	notEditable?: boolean;
	title?: string;
	lang?: string;
	multiSelect?: boolean;
	types?: string[]; // optional ['state', 'instance', 'channel']
	columns?: string[]; // optional ['name', 'type', 'role', 'room', 'func', 'val', 'buttons']
	foldersFirst?: boolean;
	customFilter?: any; // optional {common: {custom: true}} or {common: {custom: 'sql.0'}}
	statesOnly?: boolean;
	cancel?: string;
	imagePrefix?: string;
	ok?: string;
	themeType?: string;
	showExpertButton?: boolean;
	filterFunc?: any; // function to filter out all unneccessary objects. It cannot be used together with "types"
}

const styles = (theme) => ({
	headerID: {
		fontWeight: "bold",
		fontStyle: "italic",
	},
	dialog: {
		height: "95%",
	},
	dialogMobile: {
		padding: 4,
		width: "100%",
		maxWidth: "100%",
		maxHeight: "calc(100% - 16px)",
		height: "100%",
	},
	content: {
		height: "100%",
		overflow: "hidden",
	},
	contentMobile: {
		padding: "8px 4px",
	},
	titleRoot: {
		whiteSpace: "nowrap",
		width: "calc(100% - 72px)",
		overflow: "hidden",
		display: "inline-block",
		textOverflow: "ellipsis",
	},
});

export const SelectId: React.FC<SelectIdProps> = (props) => {

	function useStateCallback(initialState) {
		const [state, setState] = useState(initialState);
		const cbRef = useRef(null); // init mutable ref container for callbacks

		const setStateCallback = useCallback((state, cb) => {
			cbRef.current = cb; // store current, passed callback in ref
			setState(state);
		}, []); // keep object reference stable, exactly like `useState`

		useEffect(() => {
			// cb.current is `null` on initial render,
			// so we only invoke callback on state *updates*
			if (cbRef.current) {
				cbRef.current(state);
				cbRef.current = null; // reset callback after execution
			}
		}, [state]);

		return [state, setStateCallback];
	}

	const [themeName, setTheme] = useIoBrokerTheme();
	const connection: any = useConnection();
	const { translate: _, language } = useI18n();
	const [selected, setSelected] = useStateCallback(props.selected || []);
	const [name, setName] = React.useState<string>("");



	let dialogName = props.dialogName || "default";
	dialogName = "SelectID." + dialogName;

	let filters = window.localStorage.getItem(dialogName) || "{}";

	try {
		filters = JSON.parse(filters);
	} catch (e) {
		filters = undefined;
	}

	if (typeof selected !== "object") {
		setSelected([selected]);
	}
	setSelected(selected.filter((id) => id));

	function handleCancel() {
		props.onClose();
	}

	function handleOk() {
		props.onOk(
			props.multiSelect
				? selected
				: selected[0] || "",
			name,
		);
		props.onClose();
	}

	function handleClose() {
		props.onClose();
	}

	if (!props.isOpen) return null;


	let title;
	if (name || selected.length) {
		if (selected.length === 1) {
			title = [
				<span key="selected">{_("ra_Selected")} </span>,
				<span key="id" className={props.classes.headerID}>
						{(name || selected) +
							(name
								? " [" + selected + "]"
								: "")}
					</span>,
			];
		} else {
			title = [
				<span key="selected">{_("ra_Selected")} </span>,
				<span key="id" className={props.classes.headerID}>
						{_("%s items", selected.length)}
					</span>,
			];
		}
	} else {
		title = props.title || _("ra_Please select object ID...");
	}

	return (
		<Dialog
			disableBackdropClick
			maxWidth={false}
			disableEscapeKeyDown
			classes={{
				paper: Utils.clsx(
					props.classes.dialog,
					props.classes.dialogMobile,
				),
			}}
			fullWidth={true}
			open={true}
			aria-labelledby="selectid-dialog-title"
		>
			<DialogTitle
				id="selectid-dialog-title"
				classes={{ root: props.classes.titleRoot }}
			>
				{title}
			</DialogTitle>
			<DialogContent
				className={Utils.clsx(
					props.classes.content,
					props.classes.contentMobile,
				)}
			>
				<ObjectBrowser
					foldersFirst={props.foldersFirst}
					imagePrefix={
						props.imagePrefix || props.prefix
					} // prefix is for back compatibility
					defaultFilters={filters}
					dialogName={dialogName}
					showExpertButton={
						props.showExpertButton !== undefined
							? props.showExpertButton
							: true
					}
					style={{ width: "100%", height: "100%" }}
					columns={
						props.columns || [
							"name",
							"type",
							"role",
							"room",
							"func",
							"val",
						]
					}
					types={props.types || ["state"]}
					t={_}
					lang={props.lang || language}
					socket={connection}
					selected={selected}
					multiSelect={props.multiSelect}
					notEditable={
						props.notEditable === undefined
							? true
							: props.notEditable
					}
					name={name}
					themeName={props.themeName}
					themeType={props.themeType}
					customFilter={props.customFilter}
					onFilterChanged={(filterConfig) => {
						filters = filterConfig;
						window.localStorage.setItem(
							dialogName,
							JSON.stringify(filterConfig),
						);
					}}
					onSelect={(selected, name, isDouble) => {
						if (
							JSON.stringify(selected) !==
							JSON.stringify(selected)
						) {
							setSelected(name, () => isDouble && handleOk())
						} else if (isDouble) {
							handleOk();
						}
					}}
					filterFunc={props.filterFunc}
				/>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					onClick={() => handleOk()}
					startIcon={<IconOk />}
					disabled={!selected.length}
					color="primary"
				>
					{props.ok || _("ra_Ok")}
				</Button>
				<Button
					variant="contained"
					onClick={() => handleCancel()}
					startIcon={<IconCancel />}
				>
					{props.cancel || _("ra_Cancel")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
