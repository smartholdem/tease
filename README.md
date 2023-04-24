# tease

This package provides standardises scripts & configurations for simplified TypeScript module maintenance.

> This project is based on [borderless/ts-scripts](https://github.com/borderless/ts-scripts) and has been altered to match our configurations and preferences.

## Installation

```bash
npm install @smartholdem/tease --include=dev
```

## Usage

In your `package.json` you can use the scripts:

```json
{
	"scripts": {
		"build": "tease build",
		"lint": "tease lint",
		"format": "tease format",
		"specs": "tease specs",
		"test": "tease test",
		"prepare": "tease install && tease build"
	}
}
```

## Testing

```bash
npm run test
```

## License

tease is an open-sourced software licensed under the [MIT](LICENSE.md).
