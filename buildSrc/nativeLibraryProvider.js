import path from "path"
import fs from "fs"
import stream from "stream"
import {spawn, execFileSync} from "child_process"
import {createRequire} from "module"

/**
 * Rebuild native lib for either current node version or for electron version and
 * cache in the "native-cache" directory.
 * ABI for nodejs and for electron differs and we need to build it differently for each. We do caching
 * to avoid rebuilding between different invocations (e.g. running desktop and running tests).
 * @param environment {"electron"|"node"}
 * @param rootDir path to the root of the project
 * @param nodeModule name of the npm module to rebuild
 * @param builtPath relative path in the npm module to the output of node-gyp
 * @param log
 * @returns string path to .node for built better-sqlite3
 */
export async function getNativeLibModulePath({environment, rootDir, nodeModule, builtPath, log}) {
	const dir = path.join(rootDir, "native-cache", environment)
	await fs.promises.mkdir(dir, {recursive: true})

	const electronVersion = getVersion("electron")
	const libraryVersion = getVersion(nodeModule)

	let filePath
	if (environment === "electron") {
		filePath = `${nodeModule}-${libraryVersion}-electron-${electronVersion}.node`
	} else {
		filePath = `${nodeModule}-${libraryVersion}.node`
	}
	const outputPath = path.resolve(path.join(dir, filePath))
	try {
		// Check if the file is there
		await fs.promises.access(outputPath)
		log(`Using cached ${nodeModule} at`, outputPath)
	} catch {
		log(`Compiling ${nodeModule}..., rootDir: ${rootDir}`)
		await rebuild({environment, rootDir, electronVersion, log, nodeModule})
		await fs.promises.copyFile(path.join(await getModuleDir(rootDir, nodeModule), builtPath), outputPath)
	}
	return outputPath
}

async function rebuild({environment, rootDir, electronVersion, log, nodeModule}) {
	const libDir = await getModuleDir(rootDir, nodeModule) // path.join(rootDir, `./node_modules/${nodeModule}`)
	log("module dir is at ", libDir)
	const logStream = new stream.Writable({
		autoDestroy: true,
		write(chunk, encoding, callback) {
			log(chunk.toString())
			callback()
		},
	})
	const gypForSqlite = spawn(
		"npm exec",
		[
			"--",
			"node-gyp",
			"rebuild",
			"--release",
			"--build-from-source",
			`--arch=${process.arch}`,
			...(
				environment === "electron"
					? [
						"--runtime=electron",
						'--dist-url=https://www.electronjs.org/headers',
						`--target=${electronVersion}`,
					]
					: []
			)
		],
		{
			stdio: [null, "pipe", "pipe"],
			shell: true,
			cwd: libDir,
		}
	)
	gypForSqlite.stdout.pipe(logStream)
	gypForSqlite.stderr.pipe(logStream)
	return new Promise((resolve, reject) => {
		gypForSqlite.on('exit', (code) => {
			if (code === 0) {
				log(`Compiled ${nodeModule} successfully` + "\n")
				resolve()
			} else {
				log(`Compiling ${nodeModule} failed` + "\n")
				reject(new Error(`Compiling ${nodeModule} failed: ${code}`))
			}
		})
	})
}

function getVersion(nodeModule) {
	return execFileSync("npm", ["info", nodeModule, "version"]).toString().trim()
}

async function getModuleDir(rootDir, nodeModule) {
	// We resolve relative to the rootDir passed to us
	// however, if we just use rootDir as the base for require() it doesn't work: node_modules must be at the directory up from yours (for whatever reason).
	// so we provide a directory one level deeper. Practically it doesn't matter if "src" subdirectory exists or not, this is just to give node some
	// subdirectory to work against.
	const filePath = createRequire(path.join(rootDir, "src")).resolve(nodeModule)
	const pathEnd = path.join("node_modules", nodeModule)
	const endIndex = filePath.lastIndexOf(pathEnd)
	return path.join(filePath.substring(0, endIndex), pathEnd)
}