import ObjectBrowser from "@iobroker/adapter-react/Components/ObjectBrowser";
import type {
	ObjectBrowserColumn,
	ObjectBrowserType,
} from "@iobroker/adapter-react/Components/types";
import Utils from "@iobroker/adapter-react/Components/Utils";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconCancel from "@material-ui/icons/Cancel";
import IconOk from "@material-ui/icons/Check";
import * as React from "react";
import "regenerator-runtime/runtime";
import { useConnection, useI18n, useIoBrokerTheme } from "../../hooks";

export type ShowSelectId = (
	dialogName: string, // where to store settings in localStorage
	onClose: () => void,
	onOk: (value: any) => void,
	selected: string | string[] | undefined,
	title?: string,
	lang?: ioBroker.Languages,
	multiSelect?: boolean,
	types?: ObjectBrowserType[], // optional ['state', 'instance', 'channel']
	columns?: ObjectBrowserColumn[], // optional ['name', 'type', 'role', 'room', 'func', 'val', 'buttons']
	notEditable?: boolean,
	classes?: any,
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
	classes?: any;
	onClose: () => void;
	onOk: (value: any) => void;
	selected: string | string[] | undefined;
	notEditable?: boolean;
	title?: string;
	lang?: ioBroker.Languages;
	multiSelect?: boolean;
	types?: ObjectBrowserType[]; // optional ['state', 'instance', 'channel']
	columns?: ObjectBrowserColumn[]; // optional ['name', 'type', 'role', 'room', 'func', 'val', 'buttons']
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
	onClose: () => void;
	onOk: (value: any) => void;
	selected: string | string[] | undefined;
	title?: string;
	lang?: ioBroker.Languages;
	multiSelect?: boolean;
	types?: ObjectBrowserType[]; // optional ['state', 'instance', 'channel']
	columns?: ObjectBrowserColumn[]; // optional ['name', 'type', 'role', 'room', 'func', 'val', 'buttons']
	classes?: any;
	notEditable?: boolean;
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

const styles = (theme: string) => ({
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
	const [themeName, setTheme] = useIoBrokerTheme();
	const connection: any = useConnection();
	const { translate: _, language } = useI18n();
	const [selected, setSelected] = React.useState(props.selected || []);
	const [name, setName] = React.useState<string>("");
	const [classes, setClasses] = React.useState(
		props.classes || styles(themeName),
	);

	let dialogName = props.dialogName || "default";
	dialogName = `SelectID.${dialogName}`;

	let filters: string | undefined =
		window.localStorage.getItem(dialogName) || "{}";

	try {
		filters = JSON.parse(filters);
	} catch (e) {
		filters = undefined;
	}

	if (typeof selected !== "object") {
		setSelected([selected]);
	}
	// setSelected(selected.filter((id) => id));

	function handleCancel() {
		props.onClose();
	}

	function handleOk() {
		console.log("handleOk", props.multiSelect, selected);
		props.onOk(props.multiSelect ? selected : selected[0] || "");
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
				<span key="id" className={classes.headerID}>
					{/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */}
					{(name || selected) + (name ? ` [${selected}]` : "")}
				</span>,
			];
		} else {
			title = [
				<span key="selected">{_("ra_Selected")} </span>,
				<span key="id" className={classes.headerID}>
					{_("%s items", String(selected.length))}
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
				paper: Utils.clsx(classes.dialog, classes.dialogMobile),
			}}
			fullWidth={true}
			open={true}
			aria-labelledby="selectid-dialog-title"
		>
			<DialogTitle
				id="selectid-dialog-title"
				classes={{ root: classes.titleRoot }}
			>
				{title}
			</DialogTitle>
			<DialogContent
				className={Utils.clsx(classes.content, classes.contentMobile)}
			>
				<ObjectBrowser
					foldersFirst={props.foldersFirst}
					imagePrefix={props.imagePrefix} // prefix is for back compatibility
					dialogName={dialogName}
					showExpertButton={
						props.showExpertButton !== undefined
							? props.showExpertButton
							: true
					}
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
					themeName={themeName}
					themeType={props.themeType}
					customFilter={props.customFilter}
					onFilterChanged={(filterConfig) => {
						filters = filterConfig;
						window.localStorage.setItem(
							dialogName,
							JSON.stringify(filterConfig),
						);
					}}
					onSelect={(newSelected, newName, isDouble) => {
						console.log(selected, newSelected, newName, isDouble);
						if (
							JSON.stringify(newSelected) !==
							JSON.stringify(selected)
						) {
							console.log("running setSelected", newName);
							setSelected(newSelected);
							setName(newName);
							if (isDouble) {
								handleOk();
							}
						} else if (isDouble) {
							handleOk();
						}
					}}
					classes={classes}
					title={name}
				/>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					onClick={() => handleOk()}
					startIcon={<IconOk />}
					disabled={selected ? true : false}
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
