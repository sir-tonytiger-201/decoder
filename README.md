*Inspired by [Gematrinator](https://www.gematrinator.com/calculator)

Ciphers come from https://github.com/Alektryon/alektryon.github.io and specifically from https://github.com/Alektryon/alektryon.github.io/blob/main/calc/ciphers.js

---

# Decoder by sir_tonytiger_201

This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
```

*Note that you will need to have [Node.js](https://nodejs.org) installed.*


## Get started

Install the dependencies...

```bash
cd svelte-app
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:8080](http://localhost:8080). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

## Deploying to the web

### Manually

Follow the instructions in the previous section for creating a build. This will create files in public/build, overwriting whatever is already there.

Then go the repo https://github.com/sir-tonytiger-201/sir-tonytiger-201.github.io and switch to the gh-pages branch. Upload the bundle files there.

Here's the tricky and confusing part. Even though the build files come from public/build, they just get uploaded to the build directory, which is not under the public directory anymore. It's at the first subdirectory level of the whole project.

# decoder
