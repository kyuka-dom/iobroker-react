import { Connection, ConnectionProps } from "@iobroker/socket-client";
import { ThemeProvider } from "@material-ui/core";
import { extend } from "alcalzone-shared/objects";
import React from "react";
import { ConnectionContext } from "../hooks/useConnection";
import { GlobalsContext } from "../hooks/useGlobals";
import { defaultTranslations, I18n, I18nContext, Translations } from "../i18n";
import type { ThemeType as ThemeName } from "../shared/theme";
import getTheme from "../shared/theme";

(window as any)._ ??= (a: any) => a;

// layout components
export interface IoBrokerAppProps {
	name: ConnectionProps["name"];
	theme?: ThemeName;
	translations?: Translations;
}

const ThemeSwitcherContext = React.createContext<(theme: ThemeName) => void>(
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	() => {},
);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useThemeSwitcher = () => React.useContext(ThemeSwitcherContext);

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
	const { name, theme = "light", translations = {} } = props;

	// Manage translations
	const i18nRef = React.useRef(
		new I18n(extend({}, defaultTranslations, translations)),
	);
	const {
		language,
		setLanguage,
		extendTranslations,
		setTranslations,
		translate,
	} = i18nRef.current;

	// Manage connection
	const [connection, setConnection] = React.useState<Connection>();
	React.useEffect(() => {
		const _connection = new Connection({
			name,
			onReady: () => {
				setConnection(_connection);
				setLanguage(_connection.systemLang);
				console.log(_connection.systemLang);
			},
			onError: (err) => {
				console.error(err);
			},
		});
	}, [name, setLanguage]);

	// Manage themes
	const [themeName, setThemeName] = React.useState<ThemeName>(theme);
	const themeInstance = getTheme(themeName);

	// Manage globals
	const adminConfigMatch =
		/config\/system\.adapter\.(?<adapter>[^\.]+)\.(?<instance>\d+)/i.exec(
			window.location.hash,
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

	return (
		<GlobalsContext.Provider value={{ adapter, instance, namespace }}>
			<ThemeSwitcherContext.Provider value={setThemeName}>
				<ThemeProvider theme={themeInstance}>
					{connection ? (
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
								{props.children}
							</I18nContext.Provider>
						</ConnectionContext.Provider>
					) : (
						<>loading...</>
					)}
				</ThemeProvider>
			</ThemeSwitcherContext.Provider>
		</GlobalsContext.Provider>
	);
};
