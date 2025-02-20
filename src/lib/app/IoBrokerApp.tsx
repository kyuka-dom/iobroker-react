/* eslint-disable @typescript-eslint/no-empty-function */
import type {
	ObjectBrowserColumn,
	ObjectBrowserType,
} from "@iobroker/adapter-react/Components/types";
import { Connection, ConnectionProps } from "@iobroker/socket-client";
import { ThemeProvider } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { extend } from "alcalzone-shared/objects";
import React from "react";
import Loader from "../components/Loader";
import type { ModalState, ShowModal } from "../components/ModalDialog";
import { ModalDialog } from "../components/ModalDialog";
import type {
	NotificationState,
	ShowNotification,
} from "../components/Notification";
import { Notification } from "../components/Notification";
import type { SelectIdState, ShowSelectId } from "../components/SelectId";
import { SelectId } from "../components/SelectId";
import { ConnectionContext } from "../hooks/useConnection";
import { DialogsContext } from "../hooks/useDialogs";
import { ExpertModeContext } from "../hooks/useExpertMode";
import { GlobalsContext } from "../hooks/useGlobals";
import { IoBrokerThemeContext } from "../hooks/useIoBrokerTheme";
import { useWindowEvent } from "../hooks/useWindowEvent";
import { defaultTranslations, I18n, I18nContext, Translations } from "../i18n";
import getTheme, { getActiveTheme, ThemeName } from "../shared/theme";

// layout components
export interface IoBrokerAppProps {
	name: ConnectionProps["name"];
	translations?: Translations;
	/** When this prop exists, the loader will continue spinning until it is no longer `false` */
	contentReady?: boolean;
}

/**
 * The basis for all ioBroker apps. Wrap your app in this component. Example:
 * ```tsx
 * import { IoBrokerApp } from "iobroker-react/app";
 *
 * const MyComponent: React.FC<MyAppProps> = (props) => {
 *   // do your thing...
 *
 *   return (
 *     <div>Hello World!</div>
 *   );
 * };
 *
 * const MyApp: React.FC = () => {
 *   // This will render your component once the backend is connected
 *   return (
 *     <MyComponent name="my-adapter">
 *       <MyAppContent prop1="foo" />
 *     </IoBrokerApp>
 *   );
 * };
 * ```
 */
export const IoBrokerApp: React.FC<IoBrokerAppProps> = (props) => {
	const { name, translations = {} } = props;

	// Manage translations
	const [i18nInstance, setI18nInstance] = React.useState<I18n>({} as any);
	const {
		language,
		setLanguage,
		extendTranslations,
		setTranslations,
		translate,
	} = i18nInstance;

	// Manage connection
	const [connection, setConnection] = React.useState<Connection>();
	React.useEffect(() => {
		const _connection = new Connection({
			name,
			onReady: () => {
				// Setup translations first
				const i18n = new I18n(
					extend({}, defaultTranslations, translations),
				);
				i18n.setLanguage(_connection.systemLang);
				setI18nInstance(i18n);

				// because this will cause all child components to be rendered
				setConnection(_connection);
			},
			onError: (err) => {
				console.error(err);
			},
		});
		// We MUST not set any dependencies here, or we'll end up with 3 competing connections
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Manage themes
	const [themeName, setThemeName] = React.useState<ThemeName>(
		getActiveTheme(),
	);
	const themeInstance = getTheme(themeName);
	useWindowEvent("message", (event) => {
		if (event?.data !== "updateTheme") return;
		// Update the current theme when told to
		console.log(`updateTheme: ${getActiveTheme()}`);
		setThemeName(getActiveTheme());
	});

	// Manage globals
	const adminConfigMatch =
		/config\/system\.adapter\.(?<adapter>[^\.]+)\.(?<instance>\d+)/i.exec(
			window.parent.location.hash,
		); // tab-instances/config/system.adapter.zwave2.0
	const tabRegexMatch = /adapter\/(?<adapter>[^\/]+)/i.exec(
		window.location.pathname,
	); // /adapter/zwave2/tab_m.html?instance=0
	const adapter =
		adminConfigMatch?.groups?.adapter ??
		tabRegexMatch?.groups?.adapter ??
		"admin"; // ???
	const instance = parseInt(
		new URLSearchParams(window.location.search).get("instance") ??
			adminConfigMatch?.groups?.instance ??
			tabRegexMatch?.groups?.instance ??
			"0",
		10,
	);
	const namespace = `${adapter}.${instance}` as const;

	// Manage expert mode
	const isExpertModeActive = React.useCallback(() => {
		return window.sessionStorage.getItem("App.expertMode") === "true";
	}, []);
	const [expertMode, setExpertMode] = React.useState(isExpertModeActive());
	useWindowEvent("message", (event) => {
		if (event.data === "updateExpertMode") {
			setExpertMode(isExpertModeActive());
		}
	});

	// Simplify access to dialogs and notifications
	const [notificationState, setNotificationState] =
		React.useState<NotificationState>({
			isOpen: false,
			message: "",
			variant: "info",
		});

	const [selectIdState, setSelectIdState] = React.useState<SelectIdState>({
		isOpen: false,
		dialogName: "",
		onClose: () => {},
		onOk: () => {},
		selected: "",
	});

	const [modalState, setModalState] = React.useState<ModalState>({
		isOpen: false,
		title: "",
		message: "",
		showYesButton: true,
		yesButtonText: "Ja",
		showNoButton: true,
		noButtonText: "Nein",
		onClose: () => {},
		yesButtonClick: () => {},
		noButtonClick: () => {},
	});

	const showNotification: ShowNotification = (message, variant, timeout) => {
		setNotificationState({
			isOpen: true,
			message,
			variant,
			timeout,
		});
	};
	const hideNotification = () => {
		setNotificationState({ ...notificationState, isOpen: false });
	};

	const showSelectId: ShowSelectId = (
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
	) => {
		setSelectIdState({
			isOpen: true,
			dialogName,
			onClose,
			onOk,
			selected,
			title,
			lang,
			multiSelect,
			types,
			columns,
			notEditable,
			classes,
			foldersFirst,
			customFilter,
			statesOnly,
			cancel,
			imagePrefix,
			ok,
			themeType,
			showExpertButton,
			filterFunc,
		});
	};

	const hideSelectId = () => {
		setSelectIdState({ ...selectIdState, isOpen: false });
	};

	const hideModal = () => {
		setModalState((modalState) => ({ ...modalState, isOpen: false }));
	};
	const showModal: ShowModal = (title, text, options) => {
		return new Promise((resolve) => {
			setModalState({
				isOpen: true,
				title,
				message: text,
				onClose: () => {
					hideModal();
					resolve(false);
				},
				showYesButton: options?.showYesButton ?? true,
				yesButtonText: options?.yesButtonText ?? "Ja",
				showNoButton: options?.showNoButton ?? true,
				noButtonText: options?.noButtonText ?? "Nein",
				classNames: options?.classNames,

				yesButtonClick: () => {
					hideModal();
					resolve(true);
				},
				noButtonClick: () => {
					hideModal();
					resolve(false);
				},
			});
		});
	};

	const contentReady = !!connection && props.contentReady !== false;

	return (
		<GlobalsContext.Provider value={{ adapter, instance, namespace }}>
			<IoBrokerThemeContext.Provider
				value={{ themeName, setTheme: setThemeName }}
			>
				<ThemeProvider theme={themeInstance}>
					<CssBaseline />
					{!contentReady && <Loader />}
					{connection && (
						<ConnectionContext.Provider value={connection}>
							<I18nContext.Provider
								value={{
									language,
									setLanguage,
									extendTranslations,
									setTranslations,
									translate,
								}}
							>
								<DialogsContext.Provider
									value={{
										showNotification,
										showModal,
										hideModal,
										showSelectId,
									}}
								>
									<ExpertModeContext.Provider
										value={expertMode}
									>
										{props.children}

										{/* TODO: Maybe memo these: */}
										<Notification
											{...notificationState}
											onClose={hideNotification}
										/>
										<SelectId
											{...selectIdState}
											onClose={hideSelectId}
										/>
										<ModalDialog {...modalState} />
									</ExpertModeContext.Provider>
								</DialogsContext.Provider>
							</I18nContext.Provider>
						</ConnectionContext.Provider>
					)}
				</ThemeProvider>
			</IoBrokerThemeContext.Provider>
		</GlobalsContext.Provider>
	);
};
