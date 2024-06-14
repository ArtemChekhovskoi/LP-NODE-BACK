const wait = (milliseconds: number) =>
	new Promise((resolve) => {
		setTimeout(() => resolve("done"), milliseconds);
	});

export default wait;
