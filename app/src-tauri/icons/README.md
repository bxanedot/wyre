# Wyre application icons

The packaged Windows, Linux, and macOS icons are generated from the product mark at [`app/public/wyre-icon.svg`](../../public/wyre-icon.svg) with:

```sh
cd app
pnpm tauri icon public/wyre-icon.svg --output src-tauri/icons
```

The NSIS installer keeps its platform default artwork and uses Wyre's generated `.ico` file. Tray icons remain separate because their monochrome mask and color treatment follow each operating system's tray conventions.
