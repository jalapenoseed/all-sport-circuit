import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
const read=(name)=>readFileSync(new URL("./src/"+name,import.meta.url),"utf8");
const js=["venue.ts","poster.ts","gear.ts","match.ts","championship.ts","render.ts","ui.ts"].map(name=>stripTypeScriptTypes(read(name))).join("\n");
const html=read("shell.html").replace("/*STYLE*/",()=>read("style.css")).replace("/*GAME*/",()=>js);
mkdirSync(new URL("./dist/",import.meta.url),{recursive:true});
writeFileSync(new URL("./dist/index.html",import.meta.url),html);
