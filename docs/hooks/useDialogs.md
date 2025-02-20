# `useDialogs` hook

The `useDialogs` hook can be used to display simple [modal dialogs](https://material-ui.com/components/dialogs/) as well as [snackbar notifications](https://material-ui.com/components/snackbars/).

```ts
import { useDialogs } from "iobroker-react/hooks";
```

It returns an object with the following three methods:

```ts
interface IDialogsContext {
	/** Show a modal dialog and return true/false when it is closed */
	showModal: (
		/** The title of the modal dialog */
		title: string,
		/** The content of the modal dialog. Can be a string or any other React component */
		message: React.ReactNode | string,
		options?: Partial<{
			/** The text to show on the "yes" button */
			yesButtonText: string;
			/** The text to show on the "no" button */
			noButtonText: string;
			/** Whether the "yes" button should be enabled */
			yesButtonEnabled: boolean;
			/** Whether the "no" button should be enabled */
			noButtonEnabled: boolean;
			/** Whether the "yes" button should be visible */
			showNoButton: boolean;
			/** Whether the "no" button should be visible */
			showYesButton: boolean;
			/** Specify CSS class names for each component of the dialog. This is meant to be used with `makeStyles/useStyles`. */
			classNames?: Partial<{
				dialog: string;
				dialogTitle: string;
				dialogContent: string;
				dialogActions: string;
				yesButton: string;
				noButton: string;
			}>;
		}>,
	) => Promise<boolean>;
	/** Hide a currently open modal dialog */
	hideModal: () => void;

	showNotification: (
		/** The text to show on the notification */
		message: string,
		/** Which variant of the notification to show. Refer to https://material-ui.com/components/snackbars/ for details */
		variant: NotificationProps["variant"],
		/** How long the notification should be visible in milliseconds */
		timeout?: number,
	) => void;
}
```

The `Promise` returned by `showModal` is resolved with `true` if the user clicked the "yes" button and with `false` if the user clicked the "no" button. If the user clicked on the modal background, the promise is also resolved with `false`. For more control over this behavior, use Material UI's `Dialog` component directly.

## Example 1: Show a modal dialog on button click

```tsx
import React from "react";
import { useDialogs } from "iobroker-react/hooks";

const MyComponent: React.FC = () => {
	const { showModal } = useDialogs();

	// This will be called when the button is clicked and ask the user if they want to do this
	const askUser = React.useCallback(async () => {
		if (await showModal("My modal", "Do you want to do this?")) {
			console.log("yes");
		} else {
			console.log("no");
		}
	}, [showModal]);

	return <Button onClick={askUser}>Click me!</Button>;
};
```

## Example 2: Show a modal dialog on button click and hide it after 5 seconds

```tsx
import React from "react";
import { useDialogs } from "iobroker-react/hooks";

const MyComponent: React.FC = () => {
	const { showModal, hideModal } = useDialogs();

	// This will be called when the button is clicked and ask the user if they want to do this
	const askUser = React.useCallback(async () => {
		setTimeout(() => hideModal(), 5000);

		if (await showModal("My modal", "Do you want to do this?")) {
			console.log("yes");
		} else {
			console.log("no");
		}
	}, [showModal]);

	return <Button onClick={askUser}>Click me!</Button>;
};
```

## Example 3: Show an error notification when something goes wrong

```tsx
import React from "react";
import { useDialogs } from "iobroker-react/hooks";

const MyComponent: React.FC = () => {
	const { showNotification } = useDialogs();

	// This will be called when the button is clicked and ask the user if they want to do this
	const trySomething = React.useCallback(() => {
		try {
			something();
		} catch {
			showNotification("Something went wrong", "error");
		}
	}, [showNotification]);

	return <Button onClick={trySomething}>Click me!</Button>;
};
```
