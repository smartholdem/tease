export interface RunOptions {
	name: string;
	cwd: string;
}

export interface Config {
	dir: string;
	src: string[];
	dist: string[];
	project: string[];
}

export interface Options {
	cwd?: string;
}
