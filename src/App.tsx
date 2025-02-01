import React from 'react';

interface AppState {
	board: string[][];
}

interface AppProps {}

export class App extends React.Component<AppProps, AppState> {
	constructor(props: AppProps) {
		super(props);

		this.state = {
			board: [
				['', '', '', '', ''],
				['', '', '', '', ''],
				['', '', '', '', ''],
				['', '', '', '', ''],
				['', '', '', '', ''],
			],
		};
	}

	render(): React.ReactNode {
		return (
			<div className="App">
				<h1>Connect 4</h1>
			</div>
		);
	}
}
